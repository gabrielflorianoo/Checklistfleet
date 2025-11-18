import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import {
    ChecklistItem,
    ChecklistSection,
    VehicleChecklist,
} from '@/types/checklist';
import { getStatusEmoji } from '@/utils/statusHelpers';
import { useDocxExport } from '@/utils/useDocxExport'; // <-- IMPORTAÇÃO DO NOVO HOOK
import { usePdfExport } from '@/utils/usePdfExport';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChecklistCardProps {
    checklist: VehicleChecklist;
}

interface SectionSummary {
    sectionId: string;
    sectionTitle: string;
    emoji: string;
    totalItems: number;
    notOkCount: number;
}

const getSectionSummary = (section: ChecklistSection): SectionSummary => {
    const notOkCount = section.items.filter(
        (item) => item.status !== 'ok' && item.status !== null,
    ).length;

    return {
        sectionId: section.id,
        sectionTitle: section.title,
        emoji: section.emoji,
        totalItems: section.items.length,
        notOkCount,
    };
};

const renderItemRow = (item: ChecklistItem, colors: typeof Colors.light) => {
    const emoji = getStatusEmoji(item.status);
    return (
        <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemMain}>
                <Text style={[styles.itemEmoji]}>{emoji}</Text>
                <Text
                    style={[styles.itemName, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
            </View>
            <Text style={[styles.itemStatus, { color: colors.placeholder }]}>
                {item.status ? item.status.toUpperCase() : 'N/A'}
            </Text>
        </View>
    );
};

const renderSectionSummary = (
    summary: SectionSummary,
    colors: typeof Colors.light,
) => {
    const hasIssues = summary.notOkCount > 0;
    return (
        <View
            style={[
                styles.sectionSummaryRow,
                { borderBottomColor: colors.border },
            ]}
        >
            <View style={styles.sectionSummaryContent}>
                <Text style={styles.sectionSummaryEmoji}>{summary.emoji}</Text>
                <Text
                    style={[styles.sectionSummaryTitle, { color: colors.text }]}
                >
                    {summary.sectionTitle}
                </Text>
                <View style={styles.dotsSpacer}>
                    <Text style={[styles.dots, { color: colors.border }]}>
                        {'........................'}
                    </Text>
                </View>
            </View>
            <View style={styles.issuesBadge}>
                {hasIssues && (
                    <Text style={[styles.issuesText, { color: colors.danger }]}>
                        {summary.notOkCount} não OK
                    </Text>
                )}
            </View>
        </View>
    );
};

export const ChecklistCard = ({ checklist }: ChecklistCardProps) => {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const [isExpanded, setIsExpanded] = useState(false);
    const { exportDocx } = useDocxExport(); // <-- USANDO O NOVO HOOK
    const { exportPdf } = usePdfExport(); // <-- USANDO O HOOK DE PDF
    const router = useRouter();

    const sectionSummaries = checklist.sections.map(getSectionSummary);
    const totalNotOk = sectionSummaries.reduce(
        (sum, s) => sum + s.notOkCount,
        0,
    );

    const handleExport = (format: 'pdf' | 'docx') => {
        if (format === 'docx') {
            exportDocx(checklist);
            return;
        }

        if (format === 'pdf') {
            exportPdf(checklist);
        }
    };

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
        >
            {/* Card Header */}
            <TouchableOpacity
                style={[styles.header, { borderBottomColor: colors.border }]}
                onPress={() => setIsExpanded(!isExpanded)}
            >
                <View style={styles.headerContent}>
                    <Text style={[styles.plate, { color: colors.text }]}>
                        {checklist.plate}
                    </Text>
                    <Text
                        style={[
                            styles.driverInfo,
                            { color: colors.placeholder },
                        ]}
                    >
                        {checklist.driver} • {checklist.date}
                    </Text>
                    <View style={styles.statusBadge}>
                        {totalNotOk > 0 && (
                            <Text
                                style={[
                                    styles.statusBadgeText,
                                    { color: colors.danger },
                                ]}
                            >
                                ⚠️ {totalNotOk} não OK
                            </Text>
                        )}
                        {totalNotOk === 0 && (
                            <Text
                                style={[
                                    styles.statusBadgeText,
                                    { color: colors.success },
                                ]}
                            >
                                ✅ Tudo OK
                            </Text>
                        )}
                    </View>
                </View>
                <Text style={[styles.expandIcon, { color: colors.text }]}>
                    {isExpanded ? '▼' : '▶'}
                </Text>
            </TouchableOpacity>

            {/* Collapsed View - Section Summaries */}
            {!isExpanded && (
                <View style={styles.collapsedContent}>
                    {sectionSummaries.map((summary) => (
                        <View key={summary.sectionId}>
                            {renderSectionSummary(summary, colors)}
                        </View>
                    ))}
                </View>
            )}

            {/* Expanded View - Full Details */}
            {isExpanded && (
                <View style={styles.expandedContent}>
                    {checklist.sections.map((section) => (
                        <View
                            key={section.id}
                            style={[
                                styles.sectionContainer,
                                { borderBottomColor: colors.border },
                            ]}
                        >
                            {/* Section Header */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionEmoji}>
                                    {section.emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        { color: colors.text },
                                    ]}
                                >
                                    {section.title}
                                </Text>
                            </View>

                            {/* Items */}
                            <View>
                                {section.items.map((item) => (
                                    <View key={item.id}>
                                        {renderItemRow(item, colors)}
                                    </View>
                                ))}
                            </View>

                            {/* Section Notes */}
                            {section.sectionNotes && (
                                <View
                                    style={[
                                        styles.notesContainer,
                                        { backgroundColor: colors.surface },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.notesLabel,
                                            { color: colors.placeholder },
                                        ]}
                                    >
                                        Observações:
                                    </Text>
                                    <Text
                                        style={[
                                            styles.notesText,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {section.sectionNotes}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}

                    {/* General Notes */}
                    {checklist.generalNotes && (
                        <View
                            style={[
                                styles.generalNotesContainer,
                                { backgroundColor: colors.surface },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.notesLabel,
                                    { color: colors.placeholder },
                                ]}
                            >
                                Observações Gerais:
                            </Text>
                            <Text
                                style={[
                                    styles.notesText,
                                    { color: colors.text },
                                ]}
                            >
                                {checklist.generalNotes}
                            </Text>
                        </View>
                    )}

                    {/* Signatures */}
                    <View style={styles.signaturesContainer}>
                        {checklist.driverSignature && (
                            <View style={styles.signatureItem}>
                                <Text
                                    style={[
                                        styles.signatureLabel,
                                        { color: colors.placeholder },
                                    ]}
                                >
                                    Assinatura Motorista:
                                </Text>
                                <Text
                                    style={[
                                        styles.signatureValue,
                                        { color: colors.text },
                                    ]}
                                >
                                    {checklist.driverSignature}
                                </Text>
                            </View>
                        )}
                        {checklist.inspectorSignature && (
                            <View style={styles.signatureItem}>
                                <Text
                                    style={[
                                        styles.signatureLabel,
                                        { color: colors.placeholder },
                                    ]}
                                >
                                    Assinatura Inspetor:
                                </Text>
                                <Text
                                    style={[
                                        styles.signatureValue,
                                        { color: colors.text },
                                    ]}
                                >
                                    {checklist.inspectorSignature}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Export Buttons */}
            <View
                style={[
                    styles.exportSection,
                    { borderTopColor: colors.border },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.exportButton,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                        },
                    ]}
                    onPress={() => handleExport('pdf')}
                >
                    <Text
                        style={[
                            styles.exportButtonText,
                            { color: colors.text },
                        ]}
                    >
                        📄 PDF
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.exportButton,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                        },
                    ]}
                    onPress={() => {
                        // Navigate to the images viewer filtered to this checklist
                        try {
                            router.push(`/view-images?checklistId=${encodeURIComponent(checklist.id)}`);
                        } catch (err) {
                            console.error('Erro ao navegar para visualizador de imagens:', err);
                        }
                    }}
                >
                    <Text style={[styles.exportButtonText, { color: colors.text }]}>🖼️ Ver Imagens</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.exportButton,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                        },
                    ]}
                    onPress={() => handleExport('docx')} // Chama handleExport que delega para exportDocx
                >
                    <Text
                        style={[
                            styles.exportButtonText,
                            { color: colors.text },
                        ]}
                    >
                        📋 DOCX
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerContent: {
        flex: 1,
    },
    plate: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    driverInfo: {
        fontSize: 12,
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    expandIcon: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 12,
    },

    /* Collapsed View */
    collapsedContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sectionSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    sectionSummaryContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionSummaryEmoji: {
        fontSize: 16,
    },
    sectionSummaryTitle: {
        fontSize: 12,
        fontWeight: '600',
        flexShrink: 1,
    },
    dotsSpacer: {
        flex: 1,
        overflow: 'hidden',
    },
    dots: {
        fontSize: 10,
        letterSpacing: -2,
    },
    issuesBadge: {
        marginLeft: 8,
    },
    issuesText: {
        fontSize: 11,
        fontWeight: '600',
    },

    /* Expanded View */
    expandedContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sectionContainer: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingBottom: 8,
    },
    sectionEmoji: {
        fontSize: 18,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    itemMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemEmoji: {
        fontSize: 16,
    },
    itemName: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    itemStatus: {
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 8,
    },
    notesContainer: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        // Cor ajustada para dinâmica
        borderRadius: 6,
        marginVertical: 8,
    },
    notesLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 12,
    },
    generalNotesContainer: {
        padding: 12,
        // Cor ajustada para dinâmica
        borderRadius: 6,
        marginVertical: 12,
    },
    signaturesContainer: {
        gap: 12,
    },
    signatureItem: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    signatureLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    signatureValue: {
        fontSize: 12,
        fontWeight: '500',
    },

    /* Export Section */
    exportSection: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        borderTopWidth: 1,
    },
    exportButton: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
    },
    exportButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

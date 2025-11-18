export type ChecklistStatus = 'ok' | 'regular' | 'ruim';

export interface ChecklistItem {
    id: string;
    name: string;
    status: ChecklistStatus | null;
    notes: string;
}

export interface ChecklistSection {
    id: string;
    title: string;
    emoji: string;
    items: ChecklistItem[];
    sectionNotes: string;
}

export interface VehicleChecklist {
    id: string;
    plate: string;
    km: string;
    driver: string;
    date: string;
    time: string;
    sections: ChecklistSection[];
    images?: string[];
    generalNotes: string;
    driverSignature: string;
    inspectorSignature: string;
    createdAt: string;
    updatedAt: string;
    userId?: string;
}

export const INITIAL_SECTIONS: Omit<ChecklistSection, 'sectionNotes'>[] = [
    {
        id: 'mechanical',
        title: 'ITENS MECÂNICOS',
        emoji: '🔧',
        items: [
            {
                id: 'oil',
                name: 'Nível do óleo do motor',
                status: null,
                notes: '',
            },
            {
                id: 'coolant',
                name: 'Nível da água do radiador (líquido de arrefecimento)',
                status: null,
                notes: '',
            },
            {
                id: 'brake_fluid',
                name: 'Nível do fluido de freio',
                status: null,
                notes: '',
            },
            {
                id: 'power_steering',
                name: 'Nível do fluido da direção hidráulica',
                status: null,
                notes: '',
            },
            {
                id: 'transmission_oil',
                name: 'Nível do óleo da transmissão (quando aplicável)',
                status: null,
                notes: '',
            },
            {
                id: 'leaks',
                name: 'Vazamentos (óleo, água, combustível)',
                status: null,
                notes: '',
            },
            {
                id: 'clutch',
                name: 'Estado da embreagem',
                status: null,
                notes: '',
            },
            {
                id: 'brakes',
                name: 'Funcionamento do freio de pé e de mão',
                status: null,
                notes: '',
            },
            {
                id: 'noises',
                name: 'Ruídos anormais no motor ou câmbio',
                status: null,
                notes: '',
            },
        ],
    },
    {
        id: 'electrical',
        title: 'SISTEMA ELÉTRICO',
        emoji: '⚡',
        items: [
            {
                id: 'headlights',
                name: 'Faróis (alto e baixo)',
                status: null,
                notes: '',
            },
            {
                id: 'rear_lights',
                name: 'Lanternas traseiras e dianteiras',
                status: null,
                notes: '',
            },
            {
                id: 'brake_light',
                name: 'Luz de freio',
                status: null,
                notes: '',
            },
            { id: 'reverse_light', name: 'Luz de ré', status: null, notes: '' },
            {
                id: 'turn_signals',
                name: 'Pisca-alerta e setas',
                status: null,
                notes: '',
            },
            {
                id: 'interior_light',
                name: 'Iluminação interna',
                status: null,
                notes: '',
            },
            {
                id: 'dashboard',
                name: 'Painel de instrumentos funcionando corretamente',
                status: null,
                notes: '',
            },
            { id: 'horn', name: 'Buzina', status: null, notes: '' },
        ],
    },
    {
        id: 'external',
        title: 'PARTE EXTERNA E ESTRUTURAL',
        emoji: '🚘',
        items: [
            {
                id: 'tires',
                name: 'Estado dos pneus (desgaste e calibragem)',
                status: null,
                notes: '',
            },
            {
                id: 'spare_tire',
                name: 'Estepe em boas condições',
                status: null,
                notes: '',
            },
            {
                id: 'tools',
                name: 'Macaco e chave de roda disponíveis',
                status: null,
                notes: '',
            },
            {
                id: 'bumpers',
                name: 'Para-choques e retrovisores intactos',
                status: null,
                notes: '',
            },
            {
                id: 'wipers',
                name: 'Limpador e lavador de para-brisa funcionando',
                status: null,
                notes: '',
            },
            {
                id: 'glass',
                name: 'Vidros e parabrisas sem trincas',
                status: null,
                notes: '',
            },
            {
                id: 'doors',
                name: 'Portas, travas e vidros elétricos funcionando',
                status: null,
                notes: '',
            },
        ],
    },
    {
        id: 'interior',
        title: 'INTERIOR DO VEÍCULO',
        emoji: '🪑',
        items: [
            {
                id: 'seatbelts',
                name: 'Cintos de segurança funcionando',
                status: null,
                notes: '',
            },
            {
                id: 'seats',
                name: 'Bancos e regulagens em bom estado',
                status: null,
                notes: '',
            },
            {
                id: 'mats',
                name: 'Tapetes fixos e limpos',
                status: null,
                notes: '',
            },
            {
                id: 'ac',
                name: 'Ar-condicionado/ventilação funcionando',
                status: null,
                notes: '',
            },
            {
                id: 'fire_extinguisher',
                name: 'Extintor de incêndio (validade e lacre)',
                status: null,
                notes: '',
            },
            {
                id: 'triangle',
                name: 'Triângulo de sinalização',
                status: null,
                notes: '',
            },
            {
                id: 'documents',
                name: 'Documentos do veículo e do condutor',
                status: null,
                notes: '',
            },
        ],
    },
];

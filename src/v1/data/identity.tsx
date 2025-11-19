

export type IdentityDocumentType =
    | 'Passport'
    | 'DriverLicense'
    | 'NationalId'
    | 'PanCard'
    | 'IdCard'
    | 'VoterIdCard'
    | 'ResidentCard'
    | 'GhanaCard'
    | 'GhanaSsnitCard'
    | 'KenyaAlienCard'
    | 'ColombiaPpt';

export interface IIdentityDocumentType {
    value: IdentityDocumentType;
    label: string;
}

export enum IdentityDocumentTypeEnum {
    Passport = 'Passport',
    DriverLicense = 'DriverLicense',
    NationalId = 'NationalId',
    PanCard = 'PanCard',
    IdCard = 'IdCard',
    VoterIdCard = 'VoterIdCard',
    ResidentCard = 'ResidentCard',
    GhanaCard = 'GhanaCard',
    GhanaSsnitCard = 'GhanaSsnitCard',
    KenyaAlienCard = 'KenyaAlienCard',
    ColombiaPpt = 'ColombiaPpt',
}

const IdentityDocumentTypeOptions: IIdentityDocumentType[] = [
    { value: IdentityDocumentTypeEnum.Passport, label: 'Passport' },
    { value: IdentityDocumentTypeEnum.DriverLicense, label: 'Driver License' },
    { value: IdentityDocumentTypeEnum.NationalId, label: 'National ID' },
    { value: IdentityDocumentTypeEnum.PanCard, label: 'PAN Card' },
    { value: IdentityDocumentTypeEnum.IdCard, label: 'ID Card' },
    { value: IdentityDocumentTypeEnum.VoterIdCard, label: 'Voter ID Card' },
    { value: IdentityDocumentTypeEnum.ResidentCard, label: 'Resident Card' },
    { value: IdentityDocumentTypeEnum.GhanaCard, label: 'Ghana Card' },
    { value: IdentityDocumentTypeEnum.GhanaSsnitCard, label: 'Ghana SSNIT Card' },
    { value: IdentityDocumentTypeEnum.KenyaAlienCard, label: 'Kenya Alien Card' },
    { value: IdentityDocumentTypeEnum.ColombiaPpt, label: 'Colombia PPT' },
];

export default IdentityDocumentTypeOptions;
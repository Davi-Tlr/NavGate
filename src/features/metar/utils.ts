import { colors } from '@/constants/theme';
import { MetarProcessado } from './types';

export const COR_CONDICAO: Record<MetarProcessado['condicao'], string> = {
    VFR: colors.success,
    MVFR: colors.condMvfr,
    IFR: colors.danger,
    LIFR: colors.condLifr,
};

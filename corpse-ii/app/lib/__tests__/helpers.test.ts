import { toAscii } from '../helpers';

describe('toAscii', () => {
    it('removes accents from common Latin names', () => {
        expect(toAscii('José')).toBe('Jose');
        expect(toAscii('Álvarez')).toBe('Alvarez');
        expect(toAscii('Muñoz')).toBe('Munoz');
        expect(toAscii('Sánchez')).toBe('Sanchez');
        expect(toAscii('García')).toBe('Garcia');
        expect(toAscii('Rodríguez')).toBe('Rodriguez');
        expect(toAscii('Martínez')).toBe('Martinez');
        expect(toAscii('López')).toBe('Lopez');
        expect(toAscii('González')).toBe('Gonzalez');
        expect(toAscii('Pérez')).toBe('Perez');
    });

    it('handles strings without accents', () => {
        expect(toAscii('Smith')).toBe('Smith');
        expect(toAscii('Johnson')).toBe('Johnson');
    });

    it('handles empty string', () => {
        expect(toAscii('')).toBe('');
    });

    it('handles strings with multiple accents', () => {
        expect(toAscii('José María Álvarez')).toBe('Jose Maria Alvarez');
    });
});

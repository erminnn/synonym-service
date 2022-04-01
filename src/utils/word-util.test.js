import { groupSynonymsByWords, filterWordsWhichDoNotExistInDatabase, createWordPayload } from './word';

describe('Testing word util functions', () => {
    describe('Test groupSynonymsByWords function', () => {
        let result = [];
        beforeEach(() => {
            const words = [
                { _id: 1, name: 'Wash', synonyms: { _id: 10, synonyms: ['Clean', 'Wipe'] } },
                { _id: 2, name: 'Big', synonyms: { _id: 20, synonyms: ['Large', 'Huge'] } }
            ];

            result = groupSynonymsByWords(words);
        });

        it('Validate that function will return result', () => {
            expect(result).toBeDefined();
        });

        it('Validate that result should have synonymsIds: 10 and 20', () => {
            expect(result).toEqual(expect.arrayContaining([10, 20]));
        });

        it('Validate that function will throw error if array is null', () => {
            expect(() => {
                groupSynonymsByWords(null);
            }).toThrow('words array is null');
        });
    });

    describe('Test filterWordsWhichDoNotExistInDatabase function', () => {
        const wordsThatExistInDatabase = [
            { _id: 1, name: 'Wash', synonyms: { _id: 10, synonyms: ['Clean', 'Wipe'] } },
            { _id: 2, name: 'Big', synonyms: { _id: 20, synonyms: ['Large', 'Huge'] } }
        ];

        const words = ['Wash', 'Car', 'Truck'];
        let result = [];
        beforeEach(() => {
            result = filterWordsWhichDoNotExistInDatabase(words, wordsThatExistInDatabase);
        });

        it('Validate that function will return result', () => {
            expect(result).toBeDefined();
        });

        it('Validate that result should have Car and Truck words', () => {
            expect(result).toEqual(expect.arrayContaining(['Car', 'Truck']));
        });

        it('Validate that function will return empty array if words are same in both arrays', () => {
            expect(filterWordsWhichDoNotExistInDatabase(['Wash', 'Big'], wordsThatExistInDatabase)).toEqual(expect.arrayContaining([]));
        });

        it('Validate that function will throw error if words array is null', () => {
            expect(() => {
                filterWordsWhichDoNotExistInDatabase(null, wordsThatExistInDatabase);
            }).toThrow('words array is null');
        });

        it('Validate that function will throw error if wordsThatExistInDatabase array is null', () => {
            expect(() => {
                filterWordsWhichDoNotExistInDatabase(words, null);
            }).toThrow('wordsThatExistInDatabase array is null');
        });
    });

    describe('Test createWordPayload function', () => {
        const words = ['Wash', 'Clean'];
        let result = [];
        beforeEach(() => {
            result = createWordPayload(words, 1);
        });

        it('Validate that function will return result', () => {
            expect(result).toBeDefined();
        });

        it('Validate that all objects from result will have property name and synonyms', () => {
            result.forEach((word) => {
                expect(word).toHaveProperty('name');
                expect(word).toHaveProperty('synonyms');
            });
        });

        it('Validate that result should have array of objects [{name: "Wash",synonyms: 1},{name: "Clean",synonyms: 1}] ', () => {
            expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Wash', synonyms: 1 }), expect.objectContaining({ name: 'Clean', synonyms: 1 })]));
        });

        it('Validate that function will throw error if words array is null', () => {
            expect(() => {
                createWordPayload(null, 1);
            }).toThrow('words array is null');
        });

        it('Validate that function will throw error if synonymId is null', () => {
            expect(() => {
                createWordPayload(words, null);
            }).toThrow('synonymId is null');
        });
    });
});

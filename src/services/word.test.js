import wordService from './word';
import app from '../app';
import request from 'supertest';
import mongoose from 'mongoose';
import synonymService from './synonym';
import Word from '../models/word';
import Synonym from '../models/synonym';
import * as wordUtil from '../utils/word';

describe('Testing word service functions', () => {
    jest.setTimeout(20000);
    beforeAll(async () => {
        mongoose
            .connect(process.env.MONGO_URI_FOR_TESTING, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            .catch((error) => {
                console.log(error);
                process.exit(-1);
            });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Testing insertMultipleWords function', () => {
        it('Validate that function will throw error if words array is null', async () => {
            await expect(wordService.insertMultipleWords(null, 1)).rejects.toThrow(new Error('words array is null'));
        });
        it('Validate that function will throw error if synonymId is null', async () => {
            await expect(wordService.insertMultipleWords(['Wash'], null)).rejects.toThrow(new Error('synonymId is null'));
        });
    });

    describe('Testing findWordsFromArray function', () => {
        it('Validate that function will throw error if words array is null', async () => {
            await expect(wordService.findWordsFromArray(null)).rejects.toThrow(new Error('words array is null'));
        });
    });

    describe('Testing updateSynonymOfWords function', () => {
        it('Validate that function will throw error if words array is null', async () => {
            await expect(wordService.updateSynonymOfWords(1, null)).rejects.toThrow(new Error('words array is null'));
        });
        it('Validate that function will throw error if synonymId is null', async () => {
            await expect(wordService.updateSynonymOfWords(null, ['Wash'])).rejects.toThrow(new Error('synonymId is null'));
        });
    });

    const synonyms = ['Clean', 'Wipe'];
    describe('Testing addWord function', () => {
        beforeEach(async () => {
            await Word.deleteMany({});
            await Synonym.deleteMany({});
        });
        it('Should validate that function will throw error if word is empty string', async () => {
            await expect(wordService.addWord({ word: '', synonyms: synonyms })).rejects.toThrow(new Error('Word cannot be empty string'));
        });
        it('Should validate that function will throw error if word is empty string with supertest', async () => {
            const response = await request(app)
                .post('/api/word')
                .send({
                    word: '',
                    synonyms: ['Clean', 'Wipe']
                });

            expect(response.error).toBeTruthy();
            const { text } = response.error;
            const { message, success } = JSON.parse(text);
            expect(success).toBeFalsy();
            expect(message).toEqual('Word cannot be empty string');
        });
        it('Should validate that function will throw error if synonyms is empty array', async () => {
            await expect(wordService.addWord({ word: 'Wash', synonyms: [] })).rejects.toThrow(new Error('Synonyms cannot be empty array'));
        });

        it('Should validate that function will return status code 200 on successful adding', async () => {
            const response = await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });
            const { success } = response.body;
            expect(response.statusCode).toBe(200);
            expect(success).toBeTruthy();
        });

        it('Should validate that function will add new words to existing synonyms', async () => {
            await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });

            const response = await request(app)
                .post('/api/word')
                .send({
                    word: 'Big',
                    synonyms: ['Huge', 'Wipe']
                });

            const { success } = response.body;

            expect(success).toBeTruthy();
            expect(response.statusCode).toBe(200);
        });

        it('Should validate that function will return message if words already exist in database', async () => {
            await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });

            const response = await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });
            const { data } = response.body;

            expect(data.msg).toMatch('Words already exist');
        });

        it('Should validate that function will handle case when there is two different synonyms, and with payload they will became synonyms to each other', async () => {
            await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });

            await request(app)
                .post('/api/word')
                .send({
                    word: 'Big',
                    synonyms: ['Large', 'Huge']
                });

            const response = await request(app)
                .post('/api/word')
                .send({
                    word: 'Ermin',
                    synonyms: ['Large', 'Wash']
                });

            const { success } = response.body;

            expect(success).toBeTruthy();
            expect(response.statusCode).toBe(200);
        });

        it('Should validate that function will specify json in the content type header', async () => {
            const response = await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        });

        it('Should validate that function will call addSynonyms method from synonymService', async () => {
            const addSynonymsSpyFunction = jest.spyOn(synonymService, 'addSynonyms');
            await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });
            expect(addSynonymsSpyFunction).toHaveBeenCalled();
            expect(addSynonymsSpyFunction).toHaveBeenCalledTimes(1);
        });

        it('Should validate that function will call filterWordsWhichDoNotExistInDatabase method from wordUtil', async () => {
            const groupSynonymsByWordsSpyFunction = jest.spyOn(wordUtil, 'filterWordsWhichDoNotExistInDatabase');
            await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });
            expect(groupSynonymsByWordsSpyFunction).toHaveBeenCalled();
            expect(groupSynonymsByWordsSpyFunction).toHaveBeenCalledTimes(1);
        });

        it('Should validate that function will call createWordPayload method from wordUtil', async () => {
            const createWordPayloadSpyFunction = jest.spyOn(wordUtil, 'createWordPayload');
            await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });
            expect(createWordPayloadSpyFunction).toHaveBeenCalled();
            expect(createWordPayloadSpyFunction).toHaveBeenCalledTimes(1);
        });
    });

    describe('Test word util methods', () => {
        describe('Test filterWordsWhichDoNotExistInDatabase function', () => {
            it('Validate that function will throw error if words array is null', () => {
                expect(() => {
                    wordUtil.filterWordsWhichDoNotExistInDatabase(null, []);
                }).toThrow('words array is null');
            });

            it('Validate that function will throw error if wordsThatExistInDatabase array is null', () => {
                expect(() => {
                    wordUtil.filterWordsWhichDoNotExistInDatabase([], null);
                }).toThrow('wordsThatExistInDatabase array is null');
            });

            it('Validate that function will throw error if params are not passed', () => {
                expect(() => {
                    wordUtil.filterWordsWhichDoNotExistInDatabase();
                }).toThrow();
            });
        });

        describe('Test createWordPayload function', () => {
            it('Validate that function will throw error if words array is null', () => {
                expect(() => {
                    wordUtil.createWordPayload(null);
                }).toThrow('words array is null');
            });

            it('Validate that function will throw error if synonymId is null', () => {
                expect(() => {
                    wordUtil.createWordPayload([]);
                }).toThrow('synonymId is null');
            });

            it('Validate that function will throw error if params are not passed', () => {
                expect(() => {
                    wordUtil.createWordPayload();
                }).toThrow();
            });
        });

        describe('Test groupSynonymsByWords function', () => {
            it('Validate that function will throw error if array is null', () => {
                expect(() => {
                    wordUtil.groupSynonymsByWords(null);
                }).toThrow('words array is null');
            });
            it('Validate that function will throw error if params are not passed', () => {
                expect(() => {
                    wordUtil.groupSynonymsByWords();
                }).toThrow();
            });
        });
    });

    describe('Test synonym service methods', () => {
        describe('Test addSynonyms function', () => {
            it('Validate that function will throw error if array is null', async () => {
                await expect(synonymService.addSynonyms(null)).rejects.toThrow(new Error('Synonym payload is null'));
            });
            it('Validate that function will throw error if params are not passed', async () => {
                await expect(synonymService.addSynonyms()).rejects.toThrow();
            });
        });

        describe('Test findSynonymsFromArray function', () => {
            it('Validate that function will throw error if array is null', async () => {
                await expect(synonymService.findSynonymsFromArray(null)).rejects.toThrow(new Error('Synonyms array is null'));
            });
            it('Validate that function will throw error if params are not passed', async () => {
                await expect(synonymService.findSynonymsFromArray()).rejects.toThrow();
            });
        });

        describe('Test deleteSynonyms function', () => {
            it('Validate that function will throw error if array is null', async () => {
                await expect(synonymService.deleteSynonyms(null)).rejects.toThrow(new Error('Synonyms array is null'));
            });
            it('Validate that function will throw error if params are not passed', async () => {
                await expect(synonymService.deleteSynonyms()).rejects.toThrow();
            });
        });

        describe('Test addNewWordsToExistingSynonym function', () => {
            it('Validate that function will throw error if array is null', async () => {
                await expect(synonymService.addNewWordsToExistingSynonym(null, 1)).rejects.toThrow(new Error('Synonyms array is null'));
            });
            it('Validate that function will throw error if synonym id is null', async () => {
                await expect(synonymService.addNewWordsToExistingSynonym([], null)).rejects.toThrow(new Error('Synonym id is null'));
            });
        });
    });

    describe('Test getWords function', () => {
        it('Validate that function will get status 200', async () => {
            await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });

            const response = await request(app).get('/api/word');
            const { success } = response.body;

            expect(success).toBeTruthy();
            expect(response.statusCode).toBe(200);
        });
    });

    describe('Test searchWord function', () => {
        it('Validate that function will get status 200', async () => {
            await request(app)
                .post('/api/word')
                .send({
                    word: 'Wash',
                    synonyms: ['Clean', 'Wipe']
                });

            const response = await request(app).get('/api/word/search?word=Wash');
            const { success } = response.body;

            expect(success).toBeTruthy();
            expect(response.statusCode).toBe(200);
        });

        it('Validate that function will throw error if word is empty string', async () => {
            await expect(wordService.searchWord('')).rejects.toThrow('Word cannot be empty string');
        });
        it('Validate that function will throw error if word null or undefined', async () => {
            await expect(wordService.searchWord()).rejects.toThrow();
        });
    });
});

import { setData, typeData } from '../src/dataStore';
import {clearV1} from '../src/other'

describe('tests for clear', () => {
    test('scenarios where the user and channel lists are already empty', () => {
        let newData:typeData = {
            'users': {},
            'channels': [undefined],
            'globalOwner': [undefined],
            'sessions': {},
        }
        setData(newData);
        expect(clearV1()).toEqual({});
    });
    test('scenarios where the lists are not empty', () => {
        let newData = {
            'users': {
                'id': 1,
                'name': 'user1',
            },
            'channels': {
                'id': 1,
                'name': 'channel1',
            },
        };
        expect(clearV1()).toEqual({});
    });
});
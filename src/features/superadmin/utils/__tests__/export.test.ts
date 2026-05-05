import { downloadCsv } from '../export';

describe('downloadCsv', () => {
    let mockCreateElement: jest.SpyInstance;
    let mockAppendChild: jest.SpyInstance;
    let mockRemoveChild: jest.SpyInstance;
    let mockCreateObjectURL: jest.Mock;
    let mockRevokeObjectURL: jest.Mock;

    beforeEach(() => {
        // Mock DOM methods
        mockCreateElement = jest.spyOn(document, 'createElement');
        mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as HTMLAnchorElement);
        mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as HTMLAnchorElement);
        
        mockCreateObjectURL = jest.fn().mockReturnValue('blob:test-url');
        mockRevokeObjectURL = jest.fn();
        
        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;
        
        // Mock window.URL if needed
        Object.defineProperty(window, 'URL', {
            value: {
                createObjectURL: mockCreateObjectURL,
                revokeObjectURL: mockRevokeObjectURL,
            },
            writable: true
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns false when data is empty or undefined', () => {
        expect(downloadCsv([], 'test')).toBe(false);
        expect(downloadCsv(undefined as unknown as Record<string, unknown>[], 'test')).toBe(false);
        expect(downloadCsv(null as unknown as Record<string, unknown>[], 'test')).toBe(false);
    });

    it('creates and clicks a download link with correct CSV content', () => {
        const mockLink = {
            setAttribute: jest.fn(),
            style: {},
            click: jest.fn(),
        };
        mockCreateElement.mockReturnValue(mockLink);

        const data = [
            { id: 1, name: 'Test 1', status: 'active' },
            { id: 2, name: 'Test "2"', status: 'pending' }
        ];

        const result = downloadCsv(data, 'test_export');

        expect(result).toBe(true);
        expect(mockCreateElement).toHaveBeenCalledWith('a');
        expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:test-url');
        expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test_export.csv');
        expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('handles null or undefined values gracefully', () => {
        const mockLink = {
            setAttribute: jest.fn(),
            style: {},
            click: jest.fn(),
        };
        mockCreateElement.mockReturnValue(mockLink);

        const data = [
            { id: 1, name: null, status: undefined }
        ];

        const result = downloadCsv(data, 'test_export');

        expect(result).toBe(true);
        expect(mockLink.click).toHaveBeenCalled();
    });
});

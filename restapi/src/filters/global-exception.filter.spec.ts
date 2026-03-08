import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
    let filter: GlobalExceptionFilter;

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = jest.fn().mockReturnValue({ url: '/api/v1/users' });

    const mockArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
            getResponse: mockGetResponse,
            getRequest: mockGetRequest,
        }),
    } as unknown as ArgumentsHost;

    beforeEach(() => {
        filter = new GlobalExceptionFilter();
        jest.clearAllMocks();
    });

    it('should catch non-400 exceptions and format correctly', () => {
        const mockResponse = { message: 'Resource not found', error_code: 'NOT_FOUND', context: { id: 1 } };
        const exception = new HttpException(mockResponse, HttpStatus.NOT_FOUND);

        filter.catch(exception, mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            status: HttpStatus.NOT_FOUND,
            message: 'Resource not found',
            error_code: 'NOT_FOUND',
            context: { id: 1 },
            timestamp: expect.any(String),
            path: '/api/v1/users'
        });
    });

    it('should handle BAD_REQUEST with custom message and error_code', () => {
        const mockResponse = { message: 'Custom invalid data', error_code: 'CUSTOM_INVALID', context: { field: 'email' } };
        const exception = new HttpException(mockResponse, HttpStatus.BAD_REQUEST);

        filter.catch(exception, mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            status: HttpStatus.BAD_REQUEST,
            message: 'Custom invalid data',
            error_code: 'CUSTOM_INVALID',
            context: { field: 'email' },
            timestamp: expect.any(String),
            path: '/api/v1/users'
        });
    });

    it('should handle BAD_REQUEST and fallback to default message and error_code if omitted', () => {
        const exception = new HttpException({}, HttpStatus.BAD_REQUEST);

        filter.catch(exception, mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid user input',
            error_code: 'VALIDATION_ERROR',
            context: {},
            timestamp: expect.any(String),
            path: '/api/v1/users'
        });
    });

    it('should fallback context to the raw exception response if context is not explicitly provided', () => {
        const rawResponse = { message: 'Some Error', error_code: 'SYS_ERR' };
        const exception = new HttpException(rawResponse, HttpStatus.INTERNAL_SERVER_ERROR);

        filter.catch(exception, mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            context: rawResponse
        }));
    });
});
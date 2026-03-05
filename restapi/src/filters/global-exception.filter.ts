import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response, Request } from "express";
import { stat } from "fs";

interface IExceptionResponse {
    message: string;
    error_code: string;
    context: object | string
}

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        const status = exception.getStatus();
        const exceptionRes = exception.getResponse() as IExceptionResponse;
        let error_code = ''
        let message = ""

        if (status === HttpStatus.BAD_REQUEST) {
            error_code = exceptionRes.error_code || 'VALIDATION_ERROR';
            message = exceptionRes.message || "Invalid user input";
        } else {
            message = exceptionRes.message;
            error_code = exceptionRes.error_code;
        }
        const formattedError = {
            success: false,
            status,
            message,
            error_code,
            context: exceptionRes.context ?? exception.getResponse(),
            timestamp: new Date().toISOString(),
            path: req.url
        }
        return res.status(status).json(formattedError)
    }
}
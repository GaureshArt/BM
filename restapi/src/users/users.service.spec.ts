import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleEnum } from './dto/create-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersService],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const seedAdmin = () => service.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'password',
        phoneNumber: '+919876543210',
        role: UserRoleEnum.admin
    });

    const seedStaff = () => service.create({
        firstName: 'Staff',
        lastName: 'User',
        email: 'staff@test.com',
        password: 'password',
        phoneNumber: '+919876543210',
        role: UserRoleEnum.staff
    });

    describe('create()', () => {
        it('should successfully create a user', () => {
            const result = seedAdmin();
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
            expect(result.email).toEqual('admin@test.com');
        });

        it('should throw an HttpException (422) if email already exists', () => {
            seedAdmin();
            try {
                seedAdmin();
                fail('Should have thrown USER_ALREADY_EXISTS');
            } catch (err) {
                expect(err).toBeInstanceOf(HttpException);
                expect(err.getStatus()).toEqual(422);
                expect((err.getResponse()).error_code).toEqual('USER_ALREADY_EXISTS');
            }
        });
    });

    describe('list()', () => {
        beforeEach(() => {
            seedAdmin();
            seedStaff();
        });

        it('should paginate results correctly', () => {
            const result = service.list(1, 1);
            expect(result.data).toHaveLength(1);
            expect(result.pagination.total_records).toEqual(2);
            expect(result.pagination.total_pages).toEqual(2);
        });

        it('should throw INVALID_PAGINATION_OFFSET if page exceeds total', () => {
            try {
                service.list(5, 10);
                fail('Should have thrown INVALID_PAGINATION_OFFSET');
            } catch (err) {
                expect(err).toBeInstanceOf(HttpException);
                expect((err.getResponse() as any).error_code).toEqual('INVALID_PAGINATION_OFFSET');
            }
        });

        it('should throw INVALID_FILTER_FIELD if field does not exist', () => {
            try {
                service.list(1, 10, undefined, 'ASC', 'hackerField', 'value');
                fail('Should have thrown INVALID_FILTER_FIELD');
            } catch (err) {
                expect(err).toBeInstanceOf(HttpException);
                expect((err.getResponse()).error_code).toEqual('INVALID_FILTER_FIELD');
            }
        });

        it('should throw INVALID_SORT_FIELD if sort field does not exist', () => {
            try {
                service.list(1, 10, 'hackerField');
                fail('Should have thrown INVALID_SORT_FIELD');
            } catch (err) {
                expect(err).toBeInstanceOf(HttpException);
                expect((err.getResponse()).error_code).toEqual('INVALID_SORT_FIELD');
            }
        });
    });

    describe('findOne()', () => {
        it('should return the user if found', () => {
            const user = seedAdmin();
            const result = service.findOne(user.id);
            expect(result.id).toEqual(user.id);
        });

        it('should throw RESOURCE_NOT_FOUND if user does not exist', () => {
            try {
                service.findOne(1);
                fail('Should have thrown RESOURCE_NOT_FOUND');
            } catch (err) {
                expect(err).toBeInstanceOf(HttpException);
                expect((err.getResponse()).error_code).toEqual('RESOURCE_NOT_FOUND');
            }
        });
    });

    describe('update()', () => {
        it('should throw INVALID_CREDENTIALS if requesting user does not exist', () => {
            const target = seedAdmin();
            try {
                service.update(2, target.id, { firstName: 'Ghost' });
                fail('Should have thrown INVALID_CREDENTIALS');
            } catch (err) {
                expect((err.getResponse()).error_code).toEqual('INVALID_CREDENTIALS');
            }
        });

        it('should throw INSUFFICIENT_PERMISSIONS if staff updates another user', () => {
            const staff = seedStaff();
            const admin = seedAdmin();
            try {
                service.update(staff.id, admin.id, { firstName: 'Hacked' });
                fail('Should have thrown INSUFFICIENT_PERMISSIONS');
            } catch (err) {
                expect((err.getResponse()).error_code).toEqual('INSUFFICIENT_PERMISSIONS');
            }
        });

        it('should allow staff to update their own data', () => {
            const staff = seedStaff();
            const result = service.update(staff.id, staff.id, { firstName: 'Updated' });
            expect(result.firstName).toEqual('Updated');
        });

        it('should allow admin to update another users data', () => {
            const admin = seedAdmin();
            const staff = seedStaff();
            const result = service.update(admin.id, staff.id, { firstName: 'Updated By Admin' });
            expect(result.firstName).toEqual('Updated By Admin');
        });
    });

    describe('remove()', () => {
        it('should throw INSUFFICIENT_PERMISSIONS if staff removes another user', () => {
            const staff = seedStaff();
            const admin = seedAdmin();
            try {
                service.remove(staff.id, admin.id);
                fail('Should have thrown INSUFFICIENT_PERMISSIONS');
            } catch (err) {
                expect((err.getResponse()).error_code).toEqual('INSUFFICIENT_PERMISSIONS');
            }
        });

        it('should allow admin to remove another user', () => {
            const admin = seedAdmin();
            const staff = seedStaff();
            service.remove(admin.id, staff.id);

            try {
                service.findOne(staff.id);
            } catch (err) {
                expect((err.getResponse()).error_code).toEqual('RESOURCE_NOT_FOUND');
            }
        });
    });
    describe('timeout()', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should resolve successfully if time is under threshold', async () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.1);
            const result: any = await service.timeout();
            expect(result.success).toBe(true);
        });

        it('should reject with GATEWAY_TIMEOUT if time exceeds threshold', async () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.9);

            try {
                await service.timeout();
                fail('The request should have timed out!');

            } catch (err) {
                expect((err.getResponse()).error_code).toEqual('GATEWAY_TIMEOUT');
            }
        });
    });
});
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

    const seedAdditionalStaff = () => service.create({
        firstName: 'Zack',
        lastName: 'Smith',
        email: 'zack@test.com',
        password: 'password',
        phoneNumber: '+919876543211',
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
                expect((err.getResponse() as any).error_code).toEqual('USER_ALREADY_EXISTS');
            }
        });
    });

    describe('list()', () => {
        beforeEach(() => {
            seedAdmin();
            seedStaff();
            seedAdditionalStaff();
        });

        it('should return all records without pagination if page and limit are undefined', () => {
            const result = service.list();
            expect(result.data).toHaveLength(3);
            expect(result.pagination.current_page).toEqual(1);
            expect(result.pagination.total_pages).toEqual(1);
        });

        it('should filter results by valid filterField and filterValue', () => {
            const result = service.list(1, 10, undefined, 'ASC', 'firstName', 'Zack');
            expect(result.data).toHaveLength(1);
            expect(result.data[0].firstName).toEqual('Zack');
        });

        it('should sort results by a valid sortBy field in ASC order', () => {
            const result = service.list(1, 10, 'firstName', 'ASC');
            expect(result.data[0].firstName).toEqual('Admin');
            expect(result.data[2].firstName).toEqual('Zack');
        });

        it('should sort results by a valid sortBy field in DESC order', () => {
            const result = service.list(1, 10, 'firstName', 'DESC');
            expect(result.data[0].firstName).toEqual('Zack');
            expect(result.data[2].firstName).toEqual('Admin');
        });

        it('should paginate results correctly and calculate previous/next pages', () => {
            const result = service.list(2, 1);
            expect(result.data).toHaveLength(1);
            expect(result.pagination.total_records).toEqual(3);
            expect(result.pagination.total_pages).toEqual(3);
            expect(result.pagination.prev_page).toEqual(1);
            expect(result.pagination.next_page).toEqual(3);
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
                expect((err.getResponse() as any).error_code).toEqual('INVALID_FILTER_FIELD');
            }
        });

        it('should throw INVALID_SORT_FIELD if sort field does not exist', () => {
            try {
                service.list(1, 10, 'hackerField');
                fail('Should have thrown INVALID_SORT_FIELD');
            } catch (err) {
                expect(err).toBeInstanceOf(HttpException);
                expect((err.getResponse() as any).error_code).toEqual('INVALID_SORT_FIELD');
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
                service.findOne(999);
                fail('Should have thrown RESOURCE_NOT_FOUND');
            } catch (err) {
                expect(err).toBeInstanceOf(HttpException);
                expect((err.getResponse() as any).error_code).toEqual('RESOURCE_NOT_FOUND');
            }
        });
    });

    describe('update()', () => {
        it('should throw INVALID_CREDENTIALS if requesting user does not exist', () => {
            const target = seedAdmin();
            try {
                service.update(999, target.id, { firstName: 'Ghost' });
                fail('Should have thrown INVALID_CREDENTIALS');
            } catch (err) {
                expect((err.getResponse() as any).error_code).toEqual('INVALID_CREDENTIALS');
            }
        });

        it('should throw INSUFFICIENT_PERMISSIONS if staff updates another user', () => {
            const staff = seedStaff();
            const admin = seedAdmin();
            try {
                service.update(staff.id, admin.id, { firstName: 'Hacked' });
                fail('Should have thrown INSUFFICIENT_PERMISSIONS');
            } catch (err) {
                expect((err.getResponse() as any).error_code).toEqual('INSUFFICIENT_PERMISSIONS');
            }
        });

        it('should throw RESOURCE_NOT_FOUND if target user to update does not exist', () => {
            const admin = seedAdmin();
            try {
                service.update(admin.id, 999, { firstName: 'Ghost' });
                fail('Should have thrown RESOURCE_NOT_FOUND');
            } catch (err) {
                expect((err.getResponse() as any).error_code).toEqual('RESOURCE_NOT_FOUND');
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
        it('should throw INVALID_CREDENTIALS if requesting user does not exist', () => {
            const admin = seedAdmin();
            try {
                service.remove(999, admin.id);
                fail('Should have thrown INVALID_CREDENTIALS');
            } catch (err) {
                expect((err.getResponse() as any).error_code).toEqual('INVALID_CREDENTIALS');
            }
        });

        it('should throw INSUFFICIENT_PERMISSIONS if staff removes another user', () => {
            const staff = seedStaff();
            const admin = seedAdmin();
            try {
                service.remove(staff.id, admin.id);
                fail('Should have thrown INSUFFICIENT_PERMISSIONS');
            } catch (err) {
                expect((err.getResponse() as any).error_code).toEqual('INSUFFICIENT_PERMISSIONS');
            }
        });

        it('should throw RESOURCE_NOT_FOUND if target user to remove does not exist', () => {
            const admin = seedAdmin();
            try {
                service.remove(admin.id, 999);
                fail('Should have thrown RESOURCE_NOT_FOUND');
            } catch (err) {
                expect((err.getResponse() as any).error_code).toEqual('RESOURCE_NOT_FOUND');
            }
        });

        it('should allow staff to remove their own account', () => {
            const staff = seedStaff();
            service.remove(staff.id, staff.id);
            try {
                service.findOne(staff.id);
                fail('Should have thrown RESOURCE_NOT_FOUND');
            } catch (err) {
                expect((err.getResponse() as any).error_code).toEqual('RESOURCE_NOT_FOUND');
            }
        });

        it('should allow admin to remove another user', () => {
            const admin = seedAdmin();
            const staff = seedStaff();
            service.remove(admin.id, staff.id);

            try {
                service.findOne(staff.id);
                fail('Should have thrown RESOURCE_NOT_FOUND');
            } catch (err) {
                expect((err.getResponse() as any).error_code).toEqual('RESOURCE_NOT_FOUND');
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
                expect((err.getResponse() as any).error_code).toEqual('GATEWAY_TIMEOUT');
            }
        });
    });
});
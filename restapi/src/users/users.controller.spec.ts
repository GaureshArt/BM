import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRoleEnum } from './dto/create-user.dto';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;
    const mockUsersService = {
        create: jest.fn((dto) => ({ id: 1, ...dto })),
        list: jest.fn((page, limit) => ({ data: [], pagination: {} })),
        findOne: jest.fn((id) => ({ id, firstName: 'Test' })),
        update: jest.fn((userId, id, dto) => ({ id, ...dto })),
        remove: jest.fn((userId, id) => undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get(UsersController);
        service = module.get(UsersService);
    });

    describe('Standard Routes', () => {
        it('should call service.create with the DTO', () => {
            const dto = { firstName: 'Test', lastName: 'User', email: 'test@test.com', password: 'pw', phoneNumber: '123', role: UserRoleEnum.admin };
            controller.create(dto);
            expect(service.create).toHaveBeenCalledWith(dto);
        });

        it('should call service.list with query parameters', () => {
            const query = { page: 2, limit: 5, sortBy: 'name', order: 'ASC' as const, filterField: 'email', filterValue: 'test' };
            controller.findAll(query);

            expect(service.list).toHaveBeenCalledWith(2, 5, 'name', 'ASC', 'email', 'test');
        });

        it('should call service.findOne with the ID', () => {
            controller.findOne(1);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should call service.update with userId, targetId, and DTO', () => {
            const dto = { firstName: 'Updated' };
            controller.update(1, 1, dto);
            expect(service.update).toHaveBeenCalledWith(1, 1, dto);
        });

        it('should call service.remove with userId and targetId', () => {
            controller.remove(1, 1);
            expect(service.remove).toHaveBeenCalledWith(1, 1);
        });
    });

});
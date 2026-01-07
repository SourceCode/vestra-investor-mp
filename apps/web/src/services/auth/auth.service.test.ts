import { AuthService } from './auth.service';
import { AppDataSource } from '../../db/data-source';
import { User } from '../../db/entities/User.entity';
import { Organization, OrganizationType } from '../../db/entities/Organization.entity';
import { OrganizationMember } from '../../db/entities/OrganizationMember.entity';
import { seedRBAC } from '../../db/seeders/rbac.seeder';
import { Role } from '../../db/entities/Role.entity';
import { RolePermission } from '../../db/entities/RolePermission.entity';
import { Permission } from '../../db/entities/Permission.entity';
import { InvestorProfile } from '../../db/entities/InvestorProfile.entity';

describe('AuthService Integration', () => {
    let authService: AuthService;
    let profileRepo = AppDataSource.getRepository(InvestorProfile);

    beforeEach(async () => {
        if (AppDataSource.isInitialized) await AppDataSource.destroy();
        await AppDataSource.initialize();

        authService = new AuthService();
        profileRepo = AppDataSource.getRepository(InvestorProfile);

        // clear dependencies first to avoid FK constraint errors
        await AppDataSource.query('TRUNCATE "investor_profiles", "role_permissions", "organization_members", "roles", "permissions", "organizations", "users" CASCADE');

        // Seed RBAC for tests
        await seedRBAC();
    });

    it('should hash and verify passwords', async () => {
        const password = 'securePassword123';
        const hash = await authService.hashPassword(password);

        expect(hash).not.toBe(password);
        expect(await authService.verifyPassword(password, hash)).toBe(true);
        expect(await authService.verifyPassword('wrongPassword', hash)).toBe(false);
    });

    it('should sign up a new user and return a token', async () => {
        const input = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            organizationName: 'Test Org',
            organizationType: OrganizationType.LENDER
        };

        const { user, token } = await authService.signUp(input);

        expect(user.email).toBe(input.email);
        expect(user.passwordHash).toBeDefined();
        expect(token).toBeDefined();

        // Verify token structure
        const decoded = JSON.parse(atob(token.split('.')[1]));
        expect(decoded.email).toBe(input.email);
    });

    it('should automatically create an investor profile when registering as an investor', async () => {
        const input = {
            email: 'investor@test.com',
            password: 'password123',
            firstName: 'Inv',
            lastName: 'Estor',
            organizationName: 'Inv Org',
            organizationType: OrganizationType.INVESTOR,
            isInvestor: true
        };

        const { user } = await authService.signUp(input);

        expect(user).toBeDefined();

        const profile = await profileRepo.findOneBy({ userId: user.id });
        expect(profile).toBeDefined();
        expect(profile!.userId).toBe(user.id);
    });

    it('should sign in an existing user', async () => {
        const input = {
            email: 'login@example.com',
            password: 'password123',
            organizationName: 'Login Org',
            organizationType: OrganizationType.RE_AGENT
        };

        // Create user first
        await authService.signUp(input);

        // Sign in
        const { user, token } = await authService.signIn(input.email, input.password);

        expect(user.email).toBe(input.email);
        expect(token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
        const input = {
            email: 'fail@example.com',
            password: 'password123',
            organizationName: 'Fail Org',
            organizationType: OrganizationType.WHOLESALER
        };

        await authService.signUp(input);

        await expect(authService.signIn(input.email, 'wrongpass')).rejects.toThrow('Invalid credentials');
    });
});

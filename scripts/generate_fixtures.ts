
import crypto from 'crypto';/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const FIXTURE_DIR = path.resolve(ROOT_DIR, 'src/db/fixtures');
const CONFIG_PATH = path.resolve(ROOT_DIR, 'fixture_config.json');

// --- Configuration Loading ---

let config = {
    counts: {
        accounts: 5,
        contacts: 100,
        deals: 50,
        events: 50,
        properties: 50,
        tasks: 100,
        users: 20
    },
    seed: 12345,
    settings: {
        static_markets: true,
        use_deterministic_uuids_for_lookups: true
    }
};

if (fs.existsSync(CONFIG_PATH)) {
    try {
        const rawConfig = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const userConfig = JSON.parse(rawConfig);
        config = { ...config, ...userConfig, counts: { ...config.counts, ...userConfig.counts }, settings: { ...config.settings, ...userConfig.settings } };
        console.log('Loaded configuration from fixture_config.json');
    } catch (e) {
        console.warn('Failed to load fixture_config.json, using defaults.', e);
    }
}

// --- Helper Functions ---

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
    if (!arr || arr.length === 0) return null as any;
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
    const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(time).toISOString();
}

// Helper to generate audit fields
function generateAuditFields(userIds: string[] = [], note: string = 'Initial seed') {
    const now = new Date().toISOString();
    const userId = userIds.length > 0 ? randomChoice(userIds) : null;

    return {
        create_date: now,
        created_by_id: userId,
        is_active: 1,
        reference: '[]',
        update_date: now,
        updated_by_id: userId,
        version_note: note,
        version_num: 1
    }
}

// --- Static Data Definitions ---

const STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' }, { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

const MARKETS = [
    { name: 'Dallas', state: 'TX' }, { name: 'Houston', state: 'TX' }, { name: 'Austin', state: 'TX' },
    { name: 'Phoenix', state: 'AZ' }, { name: 'Atlanta', state: 'GA' }, { name: 'Miami', state: 'FL' },
    { name: 'Denver', state: 'CO' }, { name: 'Los Angeles', state: 'CA' }, { name: 'Chicago', state: 'IL' },
    { name: 'Nashville', state: 'TN' }
];

const LOOKUPS = {
    agent_types: [
        { code: 'LISTING', id: 'at-listing', name: 'Listing Agent' },
        { code: 'BUYER', id: 'at-buyer', name: 'Buyer Agent' },
        { code: 'TC', id: 'at-transaction', name: 'Transaction Coordinator' }
    ],
    approval_statuses: [
        { code: 'PENDING', id: 'status-pending', name: 'Pending' },
        { code: 'APPROVED', id: 'status-approved', name: 'Approved' },
        { code: 'REJECTED', id: 'status-rejected', name: 'Rejected' }
    ],
    closing_stages: [
        { code: 'DOCS', id: 'cs-docs', name: 'Docs Sent' },
        { code: 'FUNDED', id: 'cs-funded', name: 'Funded' },
        { code: 'RECORDED', id: 'cs-recorded', name: 'Recorded' }
    ],
    contact_types: [
        { code: 'CLIENT', id: 'ct-client', name: 'Client' },
        { code: 'AGENT', id: 'ct-agent', name: 'Agent' },
        { code: 'INVESTOR', id: 'ct-investor', name: 'Investor' },
        { code: 'VENDOR', id: 'ct-vendor', name: 'Vendor' }
    ],
    currencies: [
        { code: 'USD', id: 'curr-usd', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', id: 'curr-eur', name: 'Euro', symbol: '€' }
    ],
    document_types: [
        { category: 'legal', code: 'CONTRACT', id: 'dt-contract', name: 'Purchase Contract' },
        { category: 'legal', code: 'ADDENDUM', id: 'dt-addendum', name: 'Addendum' },
        { category: 'legal', code: 'DEED', id: 'dt-deed', name: 'Deed' }
    ],
    funding_types: [
        { code: 'CASH', id: 'ft-cash', name: 'Cash' },
        { code: 'PRIVATE', id: 'ft-private', name: 'Private Money' },
        { code: 'BANK', id: 'ft-bank', name: 'Bank Loan' }
    ],
    lead_sources: [
        { code: 'GOOGLE', id: 'ls-google', name: 'Google' },
        { code: 'REFERRAL', id: 'ls-referral', name: 'Referral' },
        { code: 'COLD', id: 'ls-cold-call', name: 'Cold Call' }
    ],
    payment_types: [
        { code: 'CASH', id: 'pay-cash', name: 'Cash' },
        { code: 'LOAN', id: 'pay-loan', name: 'Conventional Loan' },
        { code: 'HARD', id: 'pay-hard-money', name: 'Hard Money' }
    ],
    permissions: [
        { category: 'auth', code: 'auth.login', description: 'Can login', id: 'perm-login', name: 'Login' },
        { category: 'crm', code: 'crm.read', description: 'View CRM data', id: 'perm-crm-read', name: 'CRM Read' },
        { category: 'crm', code: 'crm.write', description: 'Edit CRM data', id: 'perm-crm-write', name: 'CRM Write' },
        { category: 'system', code: 'admin.all', description: 'Full access', id: 'perm-admin', name: 'Admin' }
    ],
    property_types: [
        { code: 'SF', id: 'pt-sf', name: 'Single Family' },
        { code: 'MF', id: 'pt-mf', name: 'Multi Family' },
        { code: 'CONDO', id: 'pt-condo', name: 'Condo' },
        { code: 'LAND', id: 'pt-land', name: 'Land' }
    ],
    roles: [
        { code: 'ADMIN', description: 'Full Access', id: 'role-admin', name: 'Administrator' },
        { code: 'AGENT', description: 'Standard Access', id: 'role-agent', name: 'Agent' }
    ]
};

const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 'Robert', 'Jennifer', 'William', 'Elizabeth', 'Joseph', 'Karen', 'Thomas', 'Nancy', 'Charles', 'Lisa', 'Daniel', 'Margaret'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore'];
const STREETS = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Blvd', 'Lakeview Dr', 'Hilltop Rd', 'Park Ave'];

// --- Writer ---

function writeFixture(filename: string, tableName: string, data: any[]) {
    if (data.length === 0) return;

    const keys = Object.keys(data[0]);
    const uniqueKeys = Array.from(new Set(keys));
    const columns = uniqueKeys.join(', ');

    let sql = `-- Generated Fixture for ${tableName}\n`;
    sql += `INSERT OR IGNORE INTO ${tableName} (${columns}) VALUES\n`;

    const rows = data.map(row => {
        const values = uniqueKeys.map(k => {
            const val = row[k];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, '\'\'')}'`;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return val;
        }).join(', ');
        return `(${values})`;
    });

    sql += rows.join(',\n') + ';\n';

    fs.writeFileSync(path.join(FIXTURE_DIR, filename), sql, 'utf-8');
    console.log(`Generated ${data.length} records for ${filename}`);
}

// --- Generator Classes / Functions ---

// 1. Core Lookups
function generateLookups(userIds: string[] = []) {
    const audit = generateAuditFields(userIds, 'System Seed');

    Object.entries(LOOKUPS).forEach(([key, values], index) => {
        // Map keys to filenames approximately
        // 0001_currencies... 0002_property_types...
        // We need a stable mapping.
        const tableName = key;
        const filename = `00${10 + index}_${tableName}.sql`; // Start at 0010

        writeFixture(filename, tableName, values.map(v => ({
            ...v,
            ...audit
        })));
    });

    // Special: Deal Stages (Dynamic creation logic but static list)
    const dealStages = [
        { code: 'NEW', id: 'stage-new', name: 'New', sort_order: 1, stage_type: 'both' },
        { code: 'PROSPECT', id: 'stage-prospecting', name: 'Prospecting', sort_order: 2, stage_type: 'both' },
        { code: 'CONTRACT', id: 'stage-contract', name: 'Under Contract', sort_order: 3, stage_type: 'both' },
        { code: 'WON', id: 'stage-closed-won', is_closed: 1, is_won: 1, name: 'Closed Won', sort_order: 4, stage_type: 'both' },
        { code: 'LOST', id: 'stage-closed-lost', is_closed: 1, name: 'Closed Lost', sort_order: 5, stage_type: 'both' },
    ];
    writeFixture('0030_deal_stages.sql', 'deal_stages', dealStages.map(s => ({ ...s, ...audit })));

    return { dealStageIds: dealStages.map(s => s.id) };
}

function generateStates(userIds: string[] = []) {
    const audit = generateAuditFields(userIds, 'System Seed');
    const data = STATES.map(s => ({
        acquisition_base_rate: 0.0,
        code: s.code,
        disposition_base_rate: 0.0,
        id: `state-${s.code.toLowerCase()}`,
        name: s.name,

        ...audit
    }));
    writeFixture('0040_states.sql', 'states', data);
    return { stateMap: new Map(data.map(s => [s.code, s.id])) };
}

function generateMarkets(stateMap: Map<string, string>, userIds: string[] = []) {
    const audit = generateAuditFields(userIds, 'System Seed');
    const data = MARKETS.map(m => {
        const id = `mkt-${m.name.toLowerCase().replace(' ', '-')}`;
        return {
            id,
            is_sms_enabled: 1,
            name: m.name,
            state_id: stateMap.get(m.state) || 'state-tx',

            ...audit
        };
    });
    writeFixture('0200_markets.sql', 'markets', data);
    return { marketIds: data.map(m => m.id), markets: data };
}

function generateOffices(markets: any[], userIds: string[] = []) {
    const audit = generateAuditFields(userIds, 'System Seed');
    const data = markets.map(m => ({
        id: `office-${m.name.toLowerCase().replace(' ', '-')}`,
        market_id: m.id,
        name: `${m.name} HQ`,

        ...audit
    }));
    writeFixture('0210_offices.sql', 'offices', data);
    return { officeIds: data.map(o => o.id) };
}

const generateUsers = (count: number) => {
    // use count if needed or underscore it
    const _count = count; // Fixed syntax and kept count parameter
    const users = [];
    const emails = new Set();
    const systemId = '00000000-0000-0000-0000-000000000000'; // Deterministic System User

    // 1. System User
    users.push({
        create_date: new Date().toISOString(),
        created_by_id: null,
        email: 'system@webos.app',
        first_name: 'System',
        id: systemId,
        is_active: 1,
        last_name: 'Admin',
        reference: '{}',
        update_date: new Date().toISOString(),
        updated_by_id: null,
        username: 'system',
        version_note: 'System User',
        version_num: 1
    });
    emails.add('system@webos.app');

    // 2. Generated Users
    for (let i = 0; i < count; i++) {
        const id = crypto.randomUUID();
        const firstName = randomChoice(FIRST_NAMES);
        const lastName = randomChoice(LAST_NAMES);
        let username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}`;
        let email = `${username}@example.com`;

        while (emails.has(email)) {
            username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99999)}`;
            email = `${username}@example.com`;
        }
        emails.add(email);

        users.push({
            create_date: new Date().toISOString(),
            created_by_id: systemId,
            email,
            first_name: firstName,
            id,
            is_active: 1,
            last_name: lastName,
            reference: '{}',
            update_date: new Date().toISOString(),
            updated_by_id: systemId,
            username,
            version_note: 'Initial seed',
            version_num: 1
        });
    }

    writeFixture('0300_users.sql', 'users', users);
    return { systemId, userIds: users.map(u => u.id) };
}

function generateAgents(userIds: string[], officeIds: string[]) {
    // Make ~30% of users agents
    const potentialAgentIds = userIds.slice(1); // Skip system
    const agentCount = Math.floor(potentialAgentIds.length * 0.3);
    const agents = [];

    for (let i = 0; i < agentCount; i++) {
        const uid = potentialAgentIds[i];
        agents.push({
            agent_type_id: 'at-listing',
            id: crypto.randomUUID(),
            license_number: `LIC-${randomInt(100000, 999999)}`,
            license_state_id: 'state-tx', // Simplified, could map to office state
            office_id: randomChoice(officeIds),
            status: 'active',
            user_id: uid,
            ...generateAuditFields(userIds)
        });
    }

    writeFixture('0310_agents.sql', 'agents', agents);
    return { agentMap: new Map(agents.map(a => [a.user_id, a.id])) };
}

// --- Entities ---

function generateAccounts(count: number, userIds: string[]) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            account_type: randomChoice(['business', 'individual']),
            id: crypto.randomUUID(),
            name: `Account ${randomChoice(LAST_NAMES)} ${randomInt(1, 100)}`,

            ...generateAuditFields(userIds)
        });
    }
    writeFixture('0400_accounts.sql', 'accounts', data);
    return { accountIds: data.map(a => a.id) };
}

function generateAddresses(count: number, userIds: string[]) {
    const addresses = [];
    for (let i = 0; i < count; i++) {
        const id = crypto.randomUUID();
        const city = randomChoice(MARKETS);
        addresses.push({
            city: city.name,
            country: 'US',
            id,
            postal_code: `${randomInt(10000, 99999)}`,
            state_id: `state-${city.state.toLowerCase()}`,
            street_line_1: `${randomInt(100, 9999)} ${randomChoice(STREETS)}`,

            ...generateAuditFields(userIds)
        });
    }
    writeFixture('0205_addresses.sql', 'addresses', addresses);
    return { addressIds: addresses.map(a => a.id) };
}

function generateProperties(count: number, addressIds: string[], userIds: string[]) {
    const properties = [];
    for (let i = 0; i < count; i++) {
        const id = crypto.randomUUID();
        const addressId = addressIds[i % addressIds.length];
        properties.push({
            address_id: addressId,
            bedrooms: randomInt(2, 6),
            full_bathrooms: randomInt(1, 4),
            id,
            property_type_id: 'pt-sf',
            total_sqft: randomInt(1000, 5000),
            year_built: randomInt(1950, 2023),

            ...generateAuditFields(userIds)
        });
    }
    writeFixture('0410_properties.sql', 'properties', properties);
    return { propertyIds: properties.map(p => p.id) };
}

function generateContacts(count: number, accountIds: string[], userIds: string[]) {
    const contacts = [];
    const emails = new Set();

    for (let i = 0; i < count; i++) {
        const id = crypto.randomUUID();
        const first = randomChoice(FIRST_NAMES);
        const last = randomChoice(LAST_NAMES);
        let email = `${first.toLowerCase()}.${last.toLowerCase()}${randomInt(1, 999)}@test.com`;
        while (emails.has(email)) email += randomInt(1, 9);
        emails.add(email);

        contacts.push({
            account_id: randomChoice(accountIds),
            contact_type_id: 'ct-client',
            email,
            first_name: first,
            id,
            last_name: last,
            lead_source_id: 'ls-google',
            owner_id: randomChoice(userIds),
            phone: `555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,

            ...generateAuditFields(userIds)
        });
    }
    writeFixture('0420_contacts.sql', 'contacts', contacts);
    return { contactIds: contacts.map(c => c.id) };
}

function generateDeals(count: number, props: { contactIds: string[], dealStageIds: string[], marketIds: string[], officeIds: string[], propertyIds: string[], userIds: string[] }) {
    const deals: any[] = [];
    const { contactIds, dealStageIds, marketIds: _marketIds, officeIds, propertyIds, userIds } = props;
    const dealNumbers = new Set();

    for (let i = 0; i < count; i++) {
        const id = crypto.randomUUID();
        const officeId = randomChoice(officeIds);
        // const marketId = randomChoice(marketIds); // Unused
        // We iterate offices to map back? Or just random.
        // For simplicity:

        let dealNum = `D-${randomInt(10000, 99999)}`;
        while (dealNumbers.has(dealNum)) dealNum = `D-${randomInt(10000, 99999)}`;
        dealNumbers.add(dealNum);

        deals.push({
            acquisition_close_date: randomDate(new Date(), new Date(Date.now() + 7776000000)),
            acquisition_price: randomInt(150000, 800000),
            deal_number: dealNum,
            deal_type: 'acquisition',
            id,
            market_id: 'mkt-dallas', // Fallback or random, needs to be valid.
            office_id: officeId,
            owner_id: randomChoice(userIds),
            property_id: randomChoice(propertyIds),
            seller_contact_id: randomChoice(contactIds),
            stage_id: randomChoice(dealStageIds),

            ...generateAuditFields(userIds)
        });
    }
    writeFixture('0500_deals.sql', 'deals', deals);
    return { dealIds: deals.map(d => d.id) };
}

function generateSystemSettings(userIds: string[]) {
    const settings = [
        { cat: 'general', key: 'company_name', type: 'string', value: 'WebOS Realty' },
        { cat: 'ui', key: 'theme', type: 'string', value: 'dark' }
    ];
    const audit = generateAuditFields(userIds, 'System Seed');

    const data = settings.map(s => ({
        category: s.cat,
        id: crypto.randomUUID(),
        setting_key: s.key,
        setting_type: s.type,
        setting_value: s.value,

        ...audit
    }));
    writeFixture('0100_system_settings.sql', 'system_settings', data);
}

function generateAuth(userIds: string[]) {
    // Roles created in Lookups (001?_roles)
    // Here we map UserRoles and RolePermissions

    // Role Permissions
    const rolePerms: any[] = [];
    // Admin gets all params from LOOKUPS.permissions (need IDs)
    const adminRoleId = 'role-admin';
    LOOKUPS.permissions.forEach(p => {
        rolePerms.push({
            id: crypto.randomUUID(),
            permission_id: p.id,
            role_id: adminRoleId,
            ...generateAuditFields(userIds)
        });
    });
    writeFixture('0120_role_permissions.sql', 'role_permissions', rolePerms);

    // User Roles
    const userRoles = [];
    const systemId = '00000000-0000-0000-0000-000000000000';
    userRoles.push({
        id: crypto.randomUUID(),
        role_id: adminRoleId,
        user_id: systemId, // System is Admin
        ...generateAuditFields(userIds)
    });

    userIds.forEach(uid => {
        if (uid !== systemId) {
            userRoles.push({
                id: crypto.randomUUID(),
                role_id: 'role-agent', // Everyone else is agent
                user_id: uid,
                ...generateAuditFields(userIds)
            });
        }
    });
    writeFixture('0130_user_roles.sql', 'user_roles', userRoles);
}

function generateGroups(userIds: string[], userCount: number) {
    // Audit
    const systemId = userIds[0]; // Assuming system is first
    const audit = generateAuditFields(userIds, 'Group Seed');

    // 1. Groups
    const groups = [
        { code: 'grp-eng', description: 'Engineering, Product, and Design', group_type: 'custom', id: '1', name: 'Engineering', scope_id: null, scope_type: 'global' },
        { code: 'grp-sales', description: 'Sales and Marketing', group_type: 'custom', id: '2', name: 'Sales', scope_id: null, scope_type: 'global' },
        { code: 'grp-exec', description: 'Senior Leadership', group_type: 'custom', id: '3', name: 'Executive', scope_id: null, scope_type: 'global' },
        { code: 'grp-hr', description: 'Human Resources', group_type: 'custom', id: '4', name: 'HR', scope_id: null, scope_type: 'global' }
    ].map(g => ({ ...g, ...audit, id: crypto.randomUUID() })); // Regen IDs

    writeFixture('1600_groups.sql', 'groups', groups);

    // 2. Members (Random assignment)
    const members: any[] = [];
    const memberSet = new Set(); // dedupe

    userIds.forEach(uid => {
        if (uid === systemId) return;

        // Add to random groups
        const count = randomInt(0, 2);
        for (let i = 0; i < count; i++) {
            const grp = randomChoice(groups);
            const key = `${grp.id}-${uid}`;
            if (!memberSet.has(key)) {
                memberSet.add(key);
                members.push({
                    added_at: new Date().toISOString(),
                    added_by_id: systemId,
                    created_at: new Date().toISOString(),
                    expires_at: null,
                    group_id: grp.id,
                    id: crypto.randomUUID(),
                    user_id: uid
                });
            }
        }
    });
    writeFixture('1601_group_members.sql', 'group_members', members);

    // 3. Group Roles (Assign some roles to groups)
    const roles: any[] = [];
    // Give Execs 'admin' role
    const execGroup = groups.find(g => g.name === 'Executive');
    if (execGroup) {
        roles.push({
            assigned_at: new Date().toISOString(),
            assigned_by_id: systemId,
            created_at: new Date().toISOString(),
            expires_at: null,
            group_id: execGroup.id,
            id: crypto.randomUUID(),
            role_id: 'role-admin', // from LOOKUPS
            scope_id: null,
            scope_type: 'global'
        });
    }
    writeFixture('1602_group_roles.sql', 'group_roles', roles);

    // 4. Invitations
    const invitations: any[] = [];
    for (let i = 0; i < 5; i++) {
        invitations.push({
            accepted_at: null,
            accepted_user_id: null,
            created_at: new Date().toISOString(),
            email: `invitee${i}@example.com`,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            first_name: `Invitee${i}`,
            id: crypto.randomUUID(),
            invited_at: new Date().toISOString(),
            invited_by_id: systemId,
            invited_groups: '[]',
            invited_roles: '["role-agent"]',
            last_name: 'Pending',
            office_id: null,
            revoked_at: null,
            revoked_by_id: null,
            status: 'pending',
            token: crypto.randomUUID(),
            updated_at: new Date().toISOString()
        });
    }
    writeFixture('1603_invitations.sql', 'invitations', invitations);
}

// --- Main Execution ---

function generate() {
    console.log(`Starting generation with seed: ${config.seed}`);
    // Deterministic random not fully implemented here (using Math.random), 
    // but in a real robust version we'd overwrite Math.random or use a seeded generator.

    // 1. Users
    console.log('Generating Users...');
    const { systemId, userIds } = generateUsers(config.counts.users);

    // 2. Lookups & States
    console.log('Generating Lookups...');
    const { dealStageIds } = generateLookups(userIds);
    const { stateMap } = generateStates(userIds);

    // 3. Markets & Offices
    console.log('Generating Markets & Offices...');
    const { marketIds, markets } = generateMarkets(stateMap, userIds);
    const { officeIds } = generateOffices(markets, userIds);

    // 4. Auth & Settings
    console.log('Generating Auth & Settings...');
    generateSystemSettings(userIds);
    generateAuth(userIds);

    // 5. Agents
    console.log('Generating Agents...');
    generateAgents(userIds, officeIds);

    // 6. Entities
    console.log('Generating Accounts & Addresses...');
    const { accountIds } = generateAccounts(config.counts.accounts, userIds);
    const { addressIds } = generateAddresses(config.counts.properties, userIds); // 1 address per property

    console.log('Generating Properties...');
    const { propertyIds } = generateProperties(config.counts.properties, addressIds, userIds);

    console.log('Generating Contacts...');
    const { contactIds } = generateContacts(config.counts.contacts, accountIds, userIds);

    // 7. Deals
    console.log('Generating Deals...');
    generateDeals(config.counts.deals, {
        contactIds, dealStageIds, marketIds, officeIds, propertyIds, userIds
    });

    // 8. Groups & Invitations
    console.log('Generating Groups...');
    generateGroups(userIds, config.counts.users);

    // 9. Tasks & Events (Placeholder simple impl)
    // ...

    console.log('Fixture Generation Complete.');
}

generate();

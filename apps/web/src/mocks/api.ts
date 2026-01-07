import { MOCK_PROPERTIES } from '../constants';
import { ActivityEvent, AgentMetrics, AgentTask, AnalyticsData, AuditLogEntry, Conversation, Deal, DealDocument, DealStatus, IntegrationConfig, InvestorProfile, InvestorSummary, MarketConfig, Message, Notification, Offer, OfferStatus, Organization, OrganizationMember, OrganizationSettings, OrgUser, Property, PropertyType, ReferralRecord, Reward, Role, ServiceIntegration, TimeRange, TransactionStep, TransactionRole, TransactionStepStatus, User } from '../types';

const DELAY_MS = 600;

// Mock Data Definitions for Types
const MOCK_DEALS: Deal[] = [];

const MOCK_ROLE: Role = {
    id: 'role_owner',
    name: 'Owner',
    description: 'Organization Owner',
    permissions: [{ id: 'p1', action: 'deal:create', description: 'Create Deals' }]
};

const MOCK_ORG: Organization = {
    id: 'org_1',
    name: 'Vestra Real Estate',
    slug: 'vestra',
    logo: 'https://placehold.co/100x100', // simple mock
    settings: {
        currency: 'USD',
        defaultCloseDays: 30,
        id: 'org_1',
        marketplaceName: 'Vestra Marketplace',
        name: 'Vestra Real Estate',
        primaryColor: '#0f172a',
        secondaryColor: '#14b8a6',
        supportEmail: 'support@vestra.com',
        timezone: 'America/Los_Angeles'
    }
};

const MOCK_MEMBERSHIPS: OrganizationMember[] = [
    {
        id: 'mem_1',
        organization: MOCK_ORG,
        organizationId: 'org_1',
        role: MOCK_ROLE,
        roleId: 'role_owner',
        userId: 'u_123'
    }
];

// Mock Data Storage (Variable initializations omitted for brevity as they are implementation details of the mock)
// ... (Keep existing mock data variables) ...
let MOCK_USER: null | User = null;
let MOCK_INVESTOR_PROFILE: InvestorProfile = {
    criteria: { dealTypes: [], locations: [], maxBudget: 2000000, minBeds: 0, minBudget: 0, strategies: [] },
    disclosuresAccepted: false,
    proofOfFundsSubmitted: false,
    status: 'LOCKED'
};
let MOCK_SAVED_IDS: string[] = [];
const MOCK_OFFERS: Offer[] = [
    { earnestMoney: 25000, id: 'o1', offerAmount: 840000, propertyId: '1', status: OfferStatus.SUBMITTED, timelineDays: 14, timestamp: new Date(Date.now() - 86400000).toISOString(), userId: 'u_99', userName: 'Jane Smith' }
];
const MOCK_ACTIVITY: ActivityEvent[] = [
    { description: 'Property listed for sale', id: 'a1', propertyId: '1', timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'STATUS_CHANGE' },
    { description: 'New offer received', id: 'a2', propertyId: '1', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'OFFER' }
];

const MOCK_TRANSACTION_STEPS: Record<string, TransactionStep[]> = {
    '4': [
        { assignedTo: TransactionRole.SYSTEM, completedAt: new Date(Date.now() - 500000000).toISOString(), id: 't1', label: 'Earnest Money Received', status: TransactionStepStatus.COMPLETE },
        { assignedTo: TransactionRole.AGENT, completedAt: new Date(Date.now() - 400000000).toISOString(), id: 't2', label: 'Purchase Contract Generated', status: TransactionStepStatus.COMPLETE },
        { assignedTo: TransactionRole.INVESTOR, id: 't3', label: 'Contract Signed (Buyer)', status: TransactionStepStatus.PENDING },
        { assignedTo: TransactionRole.SELLER, id: 't4', label: 'Contract Signed (Seller)', status: TransactionStepStatus.PENDING },
        { assignedTo: TransactionRole.AGENT, id: 't5', label: 'Title Opened', status: TransactionStepStatus.PENDING },
        { assignedTo: TransactionRole.INVESTOR, id: 't6', label: 'Inspection Period', status: TransactionStepStatus.PENDING },
        { assignedTo: TransactionRole.INVESTOR, id: 't7', label: 'Financing Approved', status: TransactionStepStatus.PENDING },
        { assignedTo: TransactionRole.AGENT, id: 't8', label: 'Clear to Close', status: TransactionStepStatus.PENDING },
        { assignedTo: TransactionRole.SYSTEM, id: 't9', label: 'Closed', status: TransactionStepStatus.PENDING },
    ]
};

const MOCK_DOCUMENTS: Record<string, DealDocument[]> = {
    '4': [
        { category: 'Contracts', id: 'd1', name: 'Purchase Agreement.pdf', propertyId: '4', requiresSignature: true, status: 'PENDING', type: 'CONTRACT', updatedAt: new Date().toISOString(), uploadedBy: 'System', url: '#' },
        { category: 'Disclosures', id: 'd2', name: 'Seller Disclosures.pdf', propertyId: '4', status: 'UPLOADED', type: 'DISCLOSURE', updatedAt: new Date().toISOString(), uploadedBy: 'Agent', url: '#' },
        { category: 'Title', id: 'd3', name: 'Prelim Title Report.pdf', propertyId: '4', status: 'UPLOADED', type: 'TITLE', updatedAt: new Date().toISOString(), uploadedBy: 'Title Co.', url: '#' },
    ]
};

const MOCK_SERVICES: Record<string, ServiceIntegration[]> = {
    '4': [
        { contactEmail: 'alice@title.com', contactName: 'Alice Title', id: 's1', name: 'Chicago Title', propertyId: '4', status: 'IN_PROGRESS', type: 'TITLE' },
        { id: 's2', name: 'LendRight Capital', propertyId: '4', status: 'NOT_STARTED', type: 'LENDER' },
        { id: 's3', name: 'SafeGuard Insurance', propertyId: '4', status: 'NOT_STARTED', type: 'INSURANCE' },
    ]
};

// Organization Data
let MOCK_ORG_SETTINGS: OrganizationSettings = {
    currency: 'USD',
    defaultCloseDays: 30,
    id: 'org_1',
    marketplaceName: 'Vestra Marketplace',
    name: 'Vestra Real Estate',
    primaryColor: '#0f172a',
    secondaryColor: '#14b8a6',
    supportEmail: 'support@vestra.com',
    timezone: 'America/Los_Angeles'
};

const MOCK_ORG_USERS: OrgUser[] = [
    { email: 'sarah@vestra.com', id: 'u1', lastActive: 'Just now', name: 'Sarah Admin', role: 'OWNER', status: 'ACTIVE' },
    { email: 'mike@vestra.com', id: 'u2', lastActive: '2h ago', name: 'Mike Agent', role: 'AGENT', status: 'ACTIVE' },
    { email: 'jane@invest.com', id: 'u3', lastActive: '1d ago', name: 'Jane Investor', role: 'INVESTOR', status: 'ACTIVE' },
];

const MOCK_INTEGRATIONS: IntegrationConfig[] = [
    { category: 'CRM', id: 'i1', provider: 'Salesforce', status: 'DISCONNECTED' },
    { category: 'SIGNATURE', id: 'i2', lastSync: '10m ago', provider: 'DocuSign', status: 'CONNECTED' },
    { category: 'ANALYTICS', id: 'i3', lastSync: '1h ago', provider: 'Google Analytics', status: 'CONNECTED' },
];

const MOCK_MARKETS: MarketConfig[] = [
    { dealCount: 142, id: 'm1', name: 'Los Angeles', state: 'CA', status: 'ACTIVE' },
    { dealCount: 89, id: 'm2', name: 'Austin', state: 'TX', status: 'ACTIVE' },
    { dealCount: 0, id: 'm3', name: 'Phoenix', state: 'AZ', status: 'INACTIVE' },
];

// Rewards Data
const MOCK_REWARDS: Reward[] = [
    { cost: 5000, description: 'Save on your next wholesale deal assignment fee.', id: 'r1', redeemed: false, title: '50% Off Assignment Fee', type: 'DISCOUNT' },
    { cost: 2500, description: 'See new deals 24 hours before the public for one month.', id: 'r2', redeemed: false, title: 'Priority Access', type: 'ACCESS' },
    { cost: 3000, description: '30-minute session with our partner real estate attorney.', id: 'r3', redeemed: false, title: 'Free Legal Consultation', type: 'SERVICE' },
];

const MOCK_REFERRALS: ReferralRecord[] = [
    { amount: 3750, date: '2024-03-10', dealAddress: '3000 E Cesar E Chavez Ave', id: 'rf1', partnerOrg: 'Equity Homes', status: 'PENDING', type: 'INBOUND' },
    { amount: 2500, date: '2024-02-15', dealAddress: '1550 Maple St', id: 'rf2', partnerOrg: 'Opendoor', status: 'PAID', type: 'OUTBOUND' },
];

// Audit Log Data
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { action: 'LOGIN', actor: 'Sarah Admin', id: 'au1', ip: '192.168.1.1', role: 'OWNER', target: 'System', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { action: 'UPDATE_DEAL', actor: 'Mike Agent', id: 'au2', ip: '192.168.1.4', role: 'AGENT', target: 'Deal #4', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { action: 'EXPORT_CONTACTS', actor: 'Sarah Admin', id: 'au3', ip: '192.168.1.1', role: 'OWNER', target: 'Investors List', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

// Messaging Data
const MOCK_CONVERSATIONS: Conversation[] = [
    {
        agentId: 'a_1',
        dealId: '1',
        id: 'c1',
        investorId: 'u_123',
        lastMessage: 'Is this property still available for viewing this weekend?',
        propertyAddress: '1240 Highland Ave',
        propertyImage: 'https://picsum.photos/800/600?random=1',
        unreadCount: 1,
        updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    'c1': [
        { body: 'Hi, I am interested in this deal.', conversationId: 'c1', createdAt: new Date(Date.now() - 86400000).toISOString(), id: 'm1', isRead: true, senderName: 'John Doe', senderRole: 'USER' },
        { body: 'Great! It is a fantastic value-add opportunity.', conversationId: 'c1', createdAt: new Date(Date.now() - 80000000).toISOString(), id: 'm2', isRead: true, senderName: 'Sarah Agent', senderRole: 'AGENT' },
        { body: 'Is this property still available for viewing this weekend?', conversationId: 'c1', createdAt: new Date(Date.now() - 3600000).toISOString(), id: 'm3', isRead: true, senderName: 'John Doe', senderRole: 'USER' }, // Marked read for demo start
        { body: 'You submitted an offer of $840,000', conversationId: 'c1', createdAt: new Date(Date.now() - 100000).toISOString(), id: 'm4', isRead: true, senderName: 'System', senderRole: 'SYSTEM' },
    ]
};

// Notifications Data
const MOCK_NOTIFICATIONS: Notification[] = [
    { body: 'A property matching your criteria in Los Angeles was just listed.', createdAt: new Date(Date.now() - 7200000).toISOString(), id: 'n1', isRead: false, link: '/property/2', title: 'New Deal Posted', type: 'DEAL_STATUS' },
    { body: 'You can now view full details for 4502 Eagle Rock Blvd.', createdAt: new Date(Date.now() - 86400000).toISOString(), id: 'n2', isRead: true, link: '/property/2', title: 'Access Approved', type: 'ACCESS_APPROVED' }
];

// Agent Data
const MOCK_AGENT_TASKS: AgentTask[] = [
    { due: 'Today', id: 't1', priority: 'HIGH', title: 'Review offer on 1240 Highland', type: 'REVIEW' },
    { due: 'Today', id: 't2', priority: 'MEDIUM', title: 'Approve access for Investor #492', type: 'ACTION' },
    { due: 'Tomorrow', id: 't3', priority: 'LOW', title: 'Respond to Sarah regarding 789 Pine', type: 'RESPONSE' },
];

const MOCK_INVESTORS: InvestorSummary[] = [
    { company: 'Acme Inv', dealViews: 12, email: 'john@example.com', firstName: 'John', id: 'u_123', lastActive: '2h ago', lastName: 'Doe', memberships: MOCK_MEMBERSHIPS, offersMade: 2, profile: MOCK_INVESTOR_PROFILE, role: 'USER', status: 'UNLOCKED' },
    { company: 'Wonder Cap', dealViews: 4, email: 'investor2@example.com', firstName: 'Alice', id: 'u_125', lastActive: '1d ago', lastName: 'Wonder', memberships: MOCK_MEMBERSHIPS, offersMade: 0, profile: MOCK_INVESTOR_PROFILE, role: 'USER', status: 'LOCKED' },
    { company: 'BuildIt', dealViews: 22, email: 'investor3@example.com', firstName: 'Bob', id: 'u_126', lastActive: '5m ago', lastName: 'Builder', memberships: MOCK_MEMBERSHIPS, offersMade: 1, profile: MOCK_INVESTOR_PROFILE, role: 'USER', status: 'PENDING' },
];

/**
 * Mock API object simulating backend interactions.
 * All methods return Promises with delayed resolution to simulate network latency.
 */
export const mockApi = {
    // --- Properties ---
    /** Fetch a list of properties based on filter criteria. */
    fetchProperties: async (filters: any): Promise<Property[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let results = [...MOCK_PROPERTIES];
                // Filter logic same as before...
                if (filters.location) {
                    const term = filters.location.toLowerCase();
                    results = results.filter(p => p.city.toLowerCase().includes(term) || p.zip.includes(term) || p.address.toLowerCase().includes(term));
                }
                if (filters.priceMin) results = results.filter(p => p.price >= filters.priceMin);
                if (filters.priceMax) results = results.filter(p => p.price <= filters.priceMax);
                if (filters.beds) results = results.filter(p => p.beds >= filters.beds);

                if (filters.sortBy === 'price_asc') results.sort((a, b) => a.price - b.price);
                if (filters.sortBy === 'price_desc') results.sort((a, b) => b.price - a.price);
                if (filters.sortBy === 'roi_desc') results.sort((a, b) => b.metrics.projectedRoi - a.metrics.projectedRoi);

                // Network filtering logic
                if (!filters.includeNetworkDeals) {
                    results = results.filter(p => !p.isNetworkDeal);
                }

                resolve(results);
            }, DELAY_MS);
        });
    },

    /** Fetch details for a specific property by ID. */
    fetchPropertyById: async (id: string): Promise<null | Property> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const property = MOCK_PROPERTIES.find(p => p.id === id);
                resolve(property || null);
            }, DELAY_MS);
        });
    },

    /** Update the status of a property (e.g., to 'OFFER_ACCEPTED'). */
    updatePropertyStatus: async (id: string, status: any): Promise<Property> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const prop = MOCK_PROPERTIES.find(p => p.id === id);
                if (prop) {
                    prop.status = status;
                    resolve({ ...prop });
                }
            }, DELAY_MS);
        });
    },

    /** Create a new property listing (mock). */
    createProperty: async (data: Partial<Property>): Promise<Property> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newProp = { ...data, id: `prop_${Date.now()} `, images: ['https://picsum.photos/800/600'], location: { lat: 34, lng: -118 }, metrics: { arv: 0, capRate: 0, estRent: 0, projectedRoi: 0, rehabEst: 0 }, status: 'DRAFT' } as Property;
                MOCK_PROPERTIES.push(newProp);
                resolve(newProp);
            }, DELAY_MS);
        });
    },

    // --- Deals (Internal) ---
    fetchDeals: async (): Promise<Deal[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_DEALS), DELAY_MS));
    },

    createDeal: async (data: Partial<Deal>): Promise<Deal> => {
        return new Promise(resolve => setTimeout(() => {
            const newDeal: Deal = {
                id: `d_${Date.now()} `,
                title: data.title || 'Untitled Deal',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                zip: data.zip || '',
                price: data.price || 0,
                status: DealStatus.DRAFT,
                organizationId: 'org_1',
                createdById: 'u_123',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                description: data.description,
                notes: data.notes
            };
            MOCK_DEALS.push(newDeal);
            resolve(newDeal);
        }, DELAY_MS));
    },

    updateDeal: async (data: Partial<Deal> & { id: string }): Promise<Deal> => {
        return new Promise(resolve => setTimeout(() => {
            const idx = MOCK_DEALS.findIndex(d => d.id === data.id);
            if (idx !== -1) {
                MOCK_DEALS[idx] = { ...MOCK_DEALS[idx], ...data, updatedAt: new Date().toISOString() };
                resolve(MOCK_DEALS[idx]);
            } else {
                throw new Error('Deal not found');
            }
        }, DELAY_MS));
    },

    // --- Auth ---
    /** Sign in a user with email and password. */
    signIn: async (email: string, password: string): Promise<{ token: string; user: User, }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'error@test.com') return reject('Invalid credentials');
                MOCK_USER = {
                    company: 'Acme Investments',
                    email,
                    firstName: 'John',
                    id: 'u_123',
                    lastName: 'Doe',
                    memberships: MOCK_MEMBERSHIPS,
                    role: email.includes('admin') ? 'ADMIN' : 'USER'
                };
                resolve({ token: 'mock_jwt_token_123', user: MOCK_USER });
            }, DELAY_MS);
        });
    },

    /** Register a new user. */
    signUp: async (data: any): Promise<{ token: string; user: User, }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                MOCK_USER = { email: data.email, firstName: data.firstName, id: 'u_124', lastName: data.lastName, memberships: MOCK_MEMBERSHIPS, role: 'USER' };
                resolve({ token: 'mock_jwt_token_124', user: MOCK_USER });
            }, DELAY_MS);
        });
    },

    /** Sign out the current user. */
    signOut: async (): Promise<void> => {
        return new Promise(resolve => setTimeout(() => { MOCK_USER = null; resolve(); }, 200));
    },

    /** Trigger a password reset email. */
    resetPassword: async () => Promise.resolve(),

    // --- Investor ---
    /** Fetch the current investor's profile and criteria. */
    fetchInvestorProfile: async (): Promise<InvestorProfile> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_INVESTOR_PROFILE), 300));
    },

    /** Update investor profile details. */
    updateInvestorProfile: async (updates: Partial<InvestorProfile>): Promise<InvestorProfile> => {
        return new Promise(resolve => setTimeout(() => {
            MOCK_INVESTOR_PROFILE = { ...MOCK_INVESTOR_PROFILE, ...updates };
            resolve(MOCK_INVESTOR_PROFILE);
        }, 500));
    },

    /** Request upgraded access to see full property details. */
    requestAccess: async (data: any): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            MOCK_INVESTOR_PROFILE.status = 'PENDING';
            resolve();
        }, DELAY_MS));
    },

    // --- Saved ---
    /** Fetch list of saved property IDs. */
    fetchSavedDeals: async (): Promise<string[]> => Promise.resolve(MOCK_SAVED_IDS),

    /** Toggle saved state for a property. */
    toggleSaveDeal: async (id: string): Promise<string[]> => {
        if (MOCK_SAVED_IDS.includes(id)) MOCK_SAVED_IDS = MOCK_SAVED_IDS.filter(sid => sid !== id);
        else MOCK_SAVED_IDS.push(id);
        return Promise.resolve([...MOCK_SAVED_IDS]);
    },

    // --- Offers ---
    /** Fetch all offers for a specific property. */
    fetchOffers: async (propertyId: string): Promise<Offer[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(MOCK_OFFERS.filter(o => o.propertyId === propertyId));
        }, DELAY_MS));
    },

    /** Submit a new offer on a property. */
    submitOffer: async (offerData: Partial<Offer>): Promise<Offer> => {
        return new Promise(resolve => setTimeout(() => {
            const newOffer: Offer = {
                earnestMoney: offerData.earnestMoney!,
                id: `o${Date.now()} `,
                notes: offerData.notes,
                offerAmount: offerData.offerAmount!,
                propertyId: offerData.propertyId!,
                status: OfferStatus.SUBMITTED,
                timelineDays: offerData.timelineDays!,
                timestamp: new Date().toISOString(),
                userId: MOCK_USER?.id || 'u_guest',
                userName: `${MOCK_USER?.firstName} ${MOCK_USER?.lastName} `
            };
            MOCK_OFFERS.push(newOffer);
            MOCK_ACTIVITY.push({
                description: `New offer submitted by ${newOffer.userName} `,
                id: `a${Date.now()} `,
                propertyId: newOffer.propertyId,
                timestamp: new Date().toISOString(),
                type: 'OFFER'
            });
            resolve(newOffer);
        }, 1000));
    },

    /** Accept an offer, rejecting others for the same property. */
    acceptOffer: async (offerId: string): Promise<Offer> => {
        return new Promise(resolve => setTimeout(() => {
            const offer = MOCK_OFFERS.find(o => o.id === offerId);
            if (offer) {
                offer.status = OfferStatus.ACCEPTED;
                // Reject others
                MOCK_OFFERS.forEach(o => {
                    if (o.propertyId === offer.propertyId && o.id !== offerId) o.status = OfferStatus.REJECTED;
                });
                MOCK_ACTIVITY.push({
                    description: `Offer from ${offer.userName} accepted.Deal moving to contract.`,
                    id: `a${Date.now()} `,
                    propertyId: offer.propertyId,
                    timestamp: new Date().toISOString(),
                    type: 'CONTRACT'
                });
            }
            resolve(offer!);
        }, 800));
    },

    // --- Activity ---
    /** Fetch activity history for a property. */
    fetchActivity: async (propertyId: string): Promise<ActivityEvent[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(MOCK_ACTIVITY.filter(a => a.propertyId === propertyId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
        }, DELAY_MS));
    },

    // --- Transactions ---
    /** Fetch transaction steps for a property. */
    fetchTransactionSteps: async (propertyId: string): Promise<TransactionStep[]> => {
        return new Promise(resolve => setTimeout(() => {
            // Default steps if none exist
            if (!MOCK_TRANSACTION_STEPS[propertyId]) {
                MOCK_TRANSACTION_STEPS[propertyId] = [
                    { assignedTo: TransactionRole.SYSTEM, completedAt: new Date(Date.now() - 500000000).toISOString(), id: 't1', label: 'Offer Accepted', status: TransactionStepStatus.COMPLETE },
                    { assignedTo: TransactionRole.SYSTEM, id: 't2', label: 'Earnest Money Received', status: TransactionStepStatus.PENDING },
                    { assignedTo: TransactionRole.INVESTOR, id: 't3', label: 'Contract Signed', status: TransactionStepStatus.PENDING },
                    { assignedTo: TransactionRole.AGENT, id: 't4', label: 'Title Opened', status: TransactionStepStatus.PENDING },
                    { assignedTo: TransactionRole.INVESTOR, id: 't5', label: 'Inspection', status: TransactionStepStatus.PENDING },
                    { assignedTo: TransactionRole.SYSTEM, id: 't6', label: 'Closing', status: TransactionStepStatus.PENDING },
                ];
            }
            resolve(MOCK_TRANSACTION_STEPS[propertyId]);
        }, DELAY_MS));
    },

    /** Update the status of a transaction step. */
    updateTransactionStep: async (propertyId: string, stepId: string): Promise<TransactionStep[]> => {
        return new Promise(resolve => setTimeout(() => {
            const steps = MOCK_TRANSACTION_STEPS[propertyId];
            const step = steps.find(s => s.id === stepId);
            if (step) {
                step.status = step.status === TransactionStepStatus.PENDING ? TransactionStepStatus.COMPLETE : TransactionStepStatus.PENDING;
                step.completedAt = step.status === TransactionStepStatus.COMPLETE ? new Date().toISOString() : undefined;
            }
            resolve([...steps]);
        }, 300));
    },

    // --- Documents ---
    /** Fetch documents associated with a property. */
    fetchDocuments: async (propertyId: string): Promise<DealDocument[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(MOCK_DOCUMENTS[propertyId] || []);
        }, DELAY_MS));
    },

    /** Upload a document to a property. */
    uploadDocument: async (propertyId: string, file: any): Promise<DealDocument> => {
        return new Promise(resolve => setTimeout(() => {
            const newDoc: DealDocument = {
                category: 'Misc',
                id: `d${Date.now()} `,
                name: 'Uploaded Document.pdf', // Mock
                propertyId,
                status: 'UPLOADED',
                type: 'OTHER',
                updatedAt: new Date().toISOString(),
                uploadedBy: 'User',
                url: '#'
            };
            if (!MOCK_DOCUMENTS[propertyId]) MOCK_DOCUMENTS[propertyId] = [];
            MOCK_DOCUMENTS[propertyId].push(newDoc);

            MOCK_ACTIVITY.push({
                description: `New document uploaded: ${newDoc.name} `,
                id: `a${Date.now()} `,
                propertyId,
                timestamp: new Date().toISOString(),
                type: 'DOCUMENT'
            });

            resolve(newDoc);
        }, 1500));
    },

    /** Sign a document electronically. */
    signDocument: async (documentId: string): Promise<DealDocument> => {
        return new Promise(resolve => setTimeout(() => {
            let foundDoc: DealDocument | undefined;
            Object.values(MOCK_DOCUMENTS).forEach(docs => {
                const d = docs.find(doc => doc.id === documentId);
                if (d) {
                    d.status = 'SIGNED';
                    foundDoc = d;

                    // Also update associated timeline step if it exists (Mock logic)
                    const step = MOCK_TRANSACTION_STEPS[d.propertyId]?.find(s => s.label.includes('Contract Signed (Buyer)'));
                    if (step) {
                        step.status = TransactionStepStatus.COMPLETE;
                        step.completedAt = new Date().toISOString();
                    }

                    MOCK_ACTIVITY.push({
                        description: `Document signed: ${d.name} `,
                        id: `a${Date.now()} `,
                        propertyId: d.propertyId,
                        timestamp: new Date().toISOString(),
                        type: 'DOCUMENT'
                    });
                }
            });
            resolve(foundDoc!);
        }, 2000));
    },

    // --- Services ---
    /** Fetch integrations/services for a property. */
    fetchServices: async (propertyId: string): Promise<ServiceIntegration[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(MOCK_SERVICES[propertyId] || []);
        }, DELAY_MS));
    },

    /** Request a new service (e.g. Title, Insurance) for a property. */
    requestService: async (propertyId: string, type: string): Promise<ServiceIntegration> => {
        return new Promise(resolve => setTimeout(() => {
            const service = MOCK_SERVICES[propertyId]?.find(s => s.type === type);
            if (service) {
                service.status = 'REQUESTED';

                MOCK_ACTIVITY.push({
                    description: `Service requested: ${service.name} `,
                    id: `a${Date.now()} `,
                    propertyId,
                    timestamp: new Date().toISOString(),
                    type: 'SERVICE'
                });
            }
            resolve(service!);
        }, 1000));
    },

    // --- Messaging ---
    /** Fetch all conversations for the user. */
    fetchConversations: async (): Promise<Conversation[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(MOCK_CONVERSATIONS);
        }, DELAY_MS));
    },

    /** Fetch messages within a conversation. */
    fetchMessages: async (conversationId: string): Promise<Message[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(MOCK_MESSAGES[conversationId] || []);
        }, DELAY_MS));
    },

    /** Send a message in a conversation. */
    sendMessage: async (conversationId: string, body: string, role: string): Promise<Message> => {
        return new Promise(resolve => setTimeout(() => {
            const newMessage: Message = {
                body,
                conversationId,
                createdAt: new Date().toISOString(),
                id: `m${Date.now()} `,
                isRead: false,
                senderName: role === 'AGENT' ? 'Sarah Agent' : 'John Doe',
                senderRole: role as any
            };

            if (!MOCK_MESSAGES[conversationId]) MOCK_MESSAGES[conversationId] = [];
            MOCK_MESSAGES[conversationId].push(newMessage);

            // Update conversation last message
            const conv = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
            if (conv) {
                conv.lastMessage = body;
                conv.updatedAt = newMessage.createdAt;
            }

            resolve(newMessage);
        }, 300)); // Fast send
    },

    /** Get an existing conversation or create a new one for a deal. */
    getOrCreateConversation: async (dealId: string): Promise<Conversation> => {
        return new Promise(resolve => setTimeout(() => {
            let conv = MOCK_CONVERSATIONS.find(c => c.dealId === dealId);
            if (!conv) {
                const prop = MOCK_PROPERTIES.find(p => p.id === dealId);
                conv = {
                    agentId: 'a_1',
                    dealId,
                    id: `c${Date.now()} `,
                    investorId: MOCK_USER?.id || 'u_guest',
                    lastMessage: '',
                    propertyAddress: prop?.address || 'Property',
                    propertyImage: prop?.image || '',
                    unreadCount: 0,
                    updatedAt: new Date().toISOString()
                };
                MOCK_CONVERSATIONS.push(conv);
            }
            resolve(conv);
        }, DELAY_MS));
    },

    // --- Notifications ---
    /** Fetch user notifications. */
    fetchNotifications: async (): Promise<Notification[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_NOTIFICATIONS), DELAY_MS));
    },

    /** Mark a notification as read. */
    markNotificationRead: async (id: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
            if (notif) notif.isRead = true;
            resolve();
        }, 200));
    },

    // --- Agent Workflows ---
    /** Fetch dashboard metrics for agents. */
    fetchAgentMetrics: async (): Promise<AgentMetrics> => {
        return new Promise(resolve => setTimeout(() => resolve({
            activeDeals: MOCK_PROPERTIES.filter(p => p.status === 'PUBLISHED').length,
            pendingOffers: MOCK_OFFERS.filter(o => o.status === 'SUBMITTED').length,
            underContract: MOCK_PROPERTIES.filter(p => p.status === 'UNDER_CONTRACT').length,
            unreadMessages: 4
        }), DELAY_MS));
    },

    /** Fetch assigned tasks for agents. */
    fetchAgentTasks: async (): Promise<AgentTask[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_AGENT_TASKS), DELAY_MS));
    },

    /** Fetch list of investors for agent CRM. */
    fetchInvestors: async (): Promise<InvestorSummary[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_INVESTORS), DELAY_MS));
    },

    /** Unlock full access for an investor. */
    unlockInvestor: async (id: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const inv = MOCK_INVESTORS.find(i => i.id === id);
            if (inv) inv.status = 'UNLOCKED';
            resolve();
        }, 500));
    },

    /** Fetch referral records for agents. */
    fetchReferrals: async (): Promise<ReferralRecord[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_REFERRALS), DELAY_MS));
    },

    // --- Analytics ---
    /** Fetch analytics data based on role and time range. */
    fetchAnalytics: async (role: 'ADMIN' | 'USER', timeRange: TimeRange): Promise<AnalyticsData> => {
        return new Promise(resolve => setTimeout(() => {
            if (role === 'ADMIN') {
                resolve({
                    charts: {
                        distribution: [
                            { name: 'Published', value: 12 }, { name: 'Under Contract', value: 5 },
                            { name: 'Closed', value: 28 }
                        ],
                        main: [
                            { name: 'Jan', value: 2 }, { name: 'Feb', value: 4 },
                            { name: 'Mar', value: 3 }, { name: 'Apr', value: 8 }
                        ],
                        secondary: [
                            { name: 'P1', value: 4 }, { name: 'P2', value: 6 },
                            { name: 'P3', value: 2 } // offers per deal
                        ]
                    },
                    insights: [
                        'Deals with professional photos close 23% faster.',
                        'Investor engagement peaks on Tuesday mornings.'
                    ],
                    kpis: [
                        { change: 2, label: 'Active Deals', trend: 'up', value: '12' },
                        { change: -5, label: 'Avg Days on Market', trend: 'down', value: '24' }, // down is good for DOM
                        { change: 4, label: 'Offer-to-Close Rate', trend: 'up', value: '38%' },
                        { change: 12, label: 'Total Volume', trend: 'up', value: '$8.2M' }
                    ]
                });
            } else {
                resolve({
                    charts: {
                        main: [ // Deal Funnel
                            { name: 'Viewed', value: 45 }, { name: 'Saved', value: 12 },
                            { name: 'Offered', value: 3 }, { name: 'Closed', value: 0 }
                        ],
                        secondary: [ // Portfolio Value (mock)
                            { name: 'Q1', value: 0 }, { name: 'Q2', value: 0 },
                            { name: 'Q3', value: 500000 }, { name: 'Q4', value: 500000 }
                        ]
                    },
                    insights: [
                        'You are most active in the Los Angeles market.',
                        'Properties with >8% Cap Rate match your criteria best.'
                    ],
                    kpis: [
                        { change: 10, label: 'Deals Viewed', trend: 'up', value: '45' },
                        { change: 0, label: 'Offers Submitted', trend: 'neutral', value: '3' },
                        { change: 1, label: 'Under Contract', trend: 'up', value: '1' },
                        { change: 0, label: 'Closed Deals', trend: 'neutral', value: '0' }
                    ]
                });
            }
        }, DELAY_MS));
    },

    // --- Organization ---
    /** Fetch organization settings. */
    fetchOrgSettings: async (): Promise<OrganizationSettings> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_ORG_SETTINGS), DELAY_MS));
    },

    /** Update organization settings. */
    updateOrgSettings: async (settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> => {
        return new Promise(resolve => setTimeout(() => {
            MOCK_ORG_SETTINGS = { ...MOCK_ORG_SETTINGS, ...settings };
            resolve(MOCK_ORG_SETTINGS);
        }, 1000));
    },

    /** Fetch all users in the organization. */
    fetchOrgUsers: async (): Promise<OrgUser[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_ORG_USERS), DELAY_MS));
    },

    /** Invite a new user to the organization. */
    inviteUser: async (email: string, role: string): Promise<OrgUser> => {
        return new Promise(resolve => setTimeout(() => {
            const newUser: OrgUser = {
                email,
                id: `u${Date.now()} `,
                lastActive: '-',
                name: email.split('@')[0],
                role: role as any,
                status: 'PENDING'
            };
            MOCK_ORG_USERS.push(newUser);
            resolve(newUser);
        }, 1000));
    },

    /** Remove a user from the organization. */
    removeUser: async (userId: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const idx = MOCK_ORG_USERS.findIndex(u => u.id === userId);
            if (idx !== -1) MOCK_ORG_USERS.splice(idx, 1);
            resolve();
        }, 1000));
    },

    /** Update a user's role. */
    updateUserRole: async (userId: string, role: string): Promise<OrgUser> => {
        return new Promise(resolve => setTimeout(() => {
            const user = MOCK_ORG_USERS.find(u => u.id === userId);
            if (user) user.role = role as any;
            resolve(user!);
        }, 800));
    },

    /** Fetch connected integrations. */
    fetchIntegrations: async (): Promise<IntegrationConfig[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_INTEGRATIONS), DELAY_MS));
    },

    /** Toggle connection status of an integration. */
    toggleIntegration: async (id: string): Promise<IntegrationConfig> => {
        return new Promise(resolve => setTimeout(() => {
            const integration = MOCK_INTEGRATIONS.find(i => i.id === id);
            if (integration) {
                integration.status = integration.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
            }
            resolve(integration!);
        }, 800));
    },

    /** Fetch configured markets. */
    fetchMarkets: async (): Promise<MarketConfig[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_MARKETS), DELAY_MS));
    },

    investor: {
        updateProfile: async (data: Partial<InvestorProfile> & { locations?: string[], propertyTypes?: string[] }) => {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            await delay(500);
            MOCK_INVESTOR_PROFILE = {
                ...MOCK_INVESTOR_PROFILE,
                ...data,
                criteria: {
                    ...MOCK_INVESTOR_PROFILE.criteria,
                    locations: data.locations || [],
                    strategies: data.propertyTypes || []
                }
            };
            return MOCK_INVESTOR_PROFILE;
        },
        getSummary: async () => {
            return { ...MOCK_USER!, dealViews: 0, lastActive: new Date().toISOString(), offersMade: 0, profile: MOCK_INVESTOR_PROFILE, status: 'PENDING' };
        }
    },

    // --- Rewards ---
    /** Fetch rewards catalog and user history. */
    fetchRewards: async (): Promise<{ catalog: Reward[]; history: any[], pointsBalance: number, }> => {
        return new Promise(resolve => setTimeout(() => {
            resolve({
                catalog: MOCK_REWARDS,
                history: [
                    { action: 'Closed Deal: 8801 Sunset', date: '2023-12-15', id: 'h1', points: 10000 },
                    { action: 'Referral: New Investor', date: '2024-01-20', id: 'h2', points: 2500 },
                ],
                pointsBalance: 12500
            });
        }, DELAY_MS));
    },

    /** Redeem a specific reward. */
    redeemReward: async (id: string): Promise<Reward> => {
        return new Promise(resolve => setTimeout(() => {
            const reward = MOCK_REWARDS.find(r => r.id === id);
            if (reward) reward.redeemed = true;
            resolve(reward!);
        }, 1000));
    },

    // --- Audit ---
    /** Fetch system audit logs. */
    fetchAuditLogs: async (): Promise<AuditLogEntry[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_AUDIT_LOGS), DELAY_MS));
    }
};

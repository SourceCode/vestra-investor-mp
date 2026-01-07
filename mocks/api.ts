
import { MOCK_PROPERTIES } from '../constants';
import { Property, User, InvestorProfile, Offer, ActivityEvent, TransactionStep, Conversation, Message, Notification, AgentMetrics, AgentTask, InvestorSummary, AnalyticsData, TimeRange, DealDocument, ServiceIntegration, OrganizationSettings, OrgUser, IntegrationConfig, MarketConfig, Reward, ReferralRecord, AuditLogEntry } from '../types';

const DELAY_MS = 600;

// Mock Data Storage (Variable initializations omitted for brevity as they are implementation details of the mock)
// ... (Keep existing mock data variables) ...
let MOCK_USER: User | null = null;
let MOCK_INVESTOR_PROFILE: InvestorProfile = {
  status: 'LOCKED',
  criteria: { locations: [], strategies: [], minBudget: 0, maxBudget: 2000000, minBeds: 0, dealTypes: [] },
  disclosuresAccepted: false,
  proofOfFundsSubmitted: false
};
let MOCK_SAVED_IDS: string[] = [];
let MOCK_OFFERS: Offer[] = [
    { id: 'o1', propertyId: '1', userId: 'u_99', userName: 'Jane Smith', offerAmount: 840000, earnestMoney: 25000, timelineDays: 14, status: 'SUBMITTED', timestamp: new Date(Date.now() - 86400000).toISOString() }
];
let MOCK_ACTIVITY: ActivityEvent[] = [
    { id: 'a1', propertyId: '1', type: 'STATUS_CHANGE', description: 'Property listed for sale', timestamp: new Date(Date.now() - 172800000).toISOString() },
    { id: 'a2', propertyId: '1', type: 'OFFER', description: 'New offer received', timestamp: new Date(Date.now() - 86400000).toISOString() }
];

let MOCK_TRANSACTION_STEPS: Record<string, TransactionStep[]> = {
    '4': [
        { id: 't1', label: 'Earnest Money Received', status: 'COMPLETE', assignedTo: 'SYSTEM', completedAt: new Date(Date.now() - 500000000).toISOString() },
        { id: 't2', label: 'Purchase Contract Generated', status: 'COMPLETE', assignedTo: 'AGENT', completedAt: new Date(Date.now() - 400000000).toISOString() },
        { id: 't3', label: 'Contract Signed (Buyer)', status: 'PENDING', assignedTo: 'INVESTOR' },
        { id: 't4', label: 'Contract Signed (Seller)', status: 'PENDING', assignedTo: 'SELLER' },
        { id: 't5', label: 'Title Opened', status: 'PENDING', assignedTo: 'AGENT' },
        { id: 't6', label: 'Inspection Period', status: 'PENDING', assignedTo: 'INVESTOR' },
        { id: 't7', label: 'Financing Approved', status: 'PENDING', assignedTo: 'INVESTOR' },
        { id: 't8', label: 'Clear to Close', status: 'PENDING', assignedTo: 'AGENT' },
        { id: 't9', label: 'Closed', status: 'PENDING', assignedTo: 'SYSTEM' },
    ]
};

let MOCK_DOCUMENTS: Record<string, DealDocument[]> = {
    '4': [
        { id: 'd1', propertyId: '4', name: 'Purchase Agreement.pdf', type: 'CONTRACT', status: 'PENDING', category: 'Contracts', url: '#', updatedAt: new Date().toISOString(), uploadedBy: 'System', requiresSignature: true },
        { id: 'd2', propertyId: '4', name: 'Seller Disclosures.pdf', type: 'DISCLOSURE', status: 'UPLOADED', category: 'Disclosures', url: '#', updatedAt: new Date().toISOString(), uploadedBy: 'Agent' },
        { id: 'd3', propertyId: '4', name: 'Prelim Title Report.pdf', type: 'TITLE', status: 'UPLOADED', category: 'Title', url: '#', updatedAt: new Date().toISOString(), uploadedBy: 'Title Co.' },
    ]
};

let MOCK_SERVICES: Record<string, ServiceIntegration[]> = {
    '4': [
        { id: 's1', propertyId: '4', name: 'Chicago Title', type: 'TITLE', status: 'IN_PROGRESS', contactName: 'Alice Title', contactEmail: 'alice@title.com' },
        { id: 's2', propertyId: '4', name: 'LendRight Capital', type: 'LENDER', status: 'NOT_STARTED' },
        { id: 's3', propertyId: '4', name: 'SafeGuard Insurance', type: 'INSURANCE', status: 'NOT_STARTED' },
    ]
};

// Organization Data
let MOCK_ORG_SETTINGS: OrganizationSettings = {
    id: 'org_1',
    name: 'Vestra Real Estate',
    marketplaceName: 'Vestra Marketplace',
    supportEmail: 'support@vestra.com',
    primaryColor: '#0f172a',
    secondaryColor: '#14b8a6',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    defaultCloseDays: 30
};

let MOCK_ORG_USERS: OrgUser[] = [
    { id: 'u1', name: 'Sarah Admin', email: 'sarah@vestra.com', role: 'OWNER', status: 'ACTIVE', lastActive: 'Just now' },
    { id: 'u2', name: 'Mike Agent', email: 'mike@vestra.com', role: 'AGENT', status: 'ACTIVE', lastActive: '2h ago' },
    { id: 'u3', name: 'Jane Investor', email: 'jane@invest.com', role: 'INVESTOR', status: 'ACTIVE', lastActive: '1d ago' },
];

let MOCK_INTEGRATIONS: IntegrationConfig[] = [
    { id: 'i1', provider: 'Salesforce', category: 'CRM', status: 'DISCONNECTED' },
    { id: 'i2', provider: 'DocuSign', category: 'SIGNATURE', status: 'CONNECTED', lastSync: '10m ago' },
    { id: 'i3', provider: 'Google Analytics', category: 'ANALYTICS', status: 'CONNECTED', lastSync: '1h ago' },
];

let MOCK_MARKETS: MarketConfig[] = [
    { id: 'm1', name: 'Los Angeles', state: 'CA', status: 'ACTIVE', dealCount: 142 },
    { id: 'm2', name: 'Austin', state: 'TX', status: 'ACTIVE', dealCount: 89 },
    { id: 'm3', name: 'Phoenix', state: 'AZ', status: 'INACTIVE', dealCount: 0 },
];

// Rewards Data
let MOCK_REWARDS: Reward[] = [
    { id: 'r1', title: '50% Off Assignment Fee', description: 'Save on your next wholesale deal assignment fee.', cost: 5000, type: 'DISCOUNT', redeemed: false },
    { id: 'r2', title: 'Priority Access', description: 'See new deals 24 hours before the public for one month.', cost: 2500, type: 'ACCESS', redeemed: false },
    { id: 'r3', title: 'Free Legal Consultation', description: '30-minute session with our partner real estate attorney.', cost: 3000, type: 'SERVICE', redeemed: false },
];

let MOCK_REFERRALS: ReferralRecord[] = [
    { id: 'rf1', dealAddress: '3000 E Cesar E Chavez Ave', partnerOrg: 'Equity Homes', status: 'PENDING', amount: 3750, date: '2024-03-10', type: 'INBOUND' },
    { id: 'rf2', dealAddress: '1550 Maple St', partnerOrg: 'Opendoor', status: 'PAID', amount: 2500, date: '2024-02-15', type: 'OUTBOUND' },
];

// Audit Log Data
let MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'au1', action: 'LOGIN', actor: 'Sarah Admin', role: 'OWNER', target: 'System', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.1' },
    { id: 'au2', action: 'UPDATE_DEAL', actor: 'Mike Agent', role: 'AGENT', target: 'Deal #4', timestamp: new Date(Date.now() - 7200000).toISOString(), ip: '192.168.1.4' },
    { id: 'au3', action: 'EXPORT_CONTACTS', actor: 'Sarah Admin', role: 'OWNER', target: 'Investors List', timestamp: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.1' },
];

// Messaging Data
let MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'c1',
        dealId: '1',
        propertyAddress: '1240 Highland Ave',
        propertyImage: 'https://picsum.photos/800/600?random=1',
        investorId: 'u_123',
        agentId: 'a_1',
        lastMessage: 'Is this property still available for viewing this weekend?',
        unreadCount: 1,
        updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
];

let MOCK_MESSAGES: Record<string, Message[]> = {
    'c1': [
        { id: 'm1', conversationId: 'c1', senderRole: 'USER', senderName: 'John Doe', body: 'Hi, I am interested in this deal.', createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: true },
        { id: 'm2', conversationId: 'c1', senderRole: 'AGENT', senderName: 'Sarah Agent', body: 'Great! It is a fantastic value-add opportunity.', createdAt: new Date(Date.now() - 80000000).toISOString(), isRead: true },
        { id: 'm3', conversationId: 'c1', senderRole: 'USER', senderName: 'John Doe', body: 'Is this property still available for viewing this weekend?', createdAt: new Date(Date.now() - 3600000).toISOString(), isRead: true }, // Marked read for demo start
        { id: 'm4', conversationId: 'c1', senderRole: 'SYSTEM', senderName: 'System', body: 'You submitted an offer of $840,000', createdAt: new Date(Date.now() - 100000).toISOString(), isRead: true },
    ]
};

// Notifications Data
let MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1', type: 'DEAL_STATUS', title: 'New Deal Posted', body: 'A property matching your criteria in Los Angeles was just listed.', link: '/property/2', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'n2', type: 'ACCESS_APPROVED', title: 'Access Approved', body: 'You can now view full details for 4502 Eagle Rock Blvd.', link: '/property/2', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
];

// Agent Data
let MOCK_AGENT_TASKS: AgentTask[] = [
    { id: 't1', title: 'Review offer on 1240 Highland', priority: 'HIGH', type: 'REVIEW', due: 'Today' },
    { id: 't2', title: 'Approve access for Investor #492', priority: 'MEDIUM', type: 'ACTION', due: 'Today' },
    { id: 't3', title: 'Respond to Sarah regarding 789 Pine', priority: 'LOW', type: 'RESPONSE', due: 'Tomorrow' },
];

let MOCK_INVESTORS: InvestorSummary[] = [
    { id: 'u_123', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'USER', company: 'Acme Inv', status: 'UNLOCKED', lastActive: '2h ago', dealViews: 12, offersMade: 2, profile: MOCK_INVESTOR_PROFILE },
    { id: 'u_125', email: 'investor2@example.com', firstName: 'Alice', lastName: 'Wonder', role: 'USER', company: 'Wonder Cap', status: 'LOCKED', lastActive: '1d ago', dealViews: 4, offersMade: 0, profile: MOCK_INVESTOR_PROFILE },
    { id: 'u_126', email: 'investor3@example.com', firstName: 'Bob', lastName: 'Builder', role: 'USER', company: 'BuildIt', status: 'PENDING', lastActive: '5m ago', dealViews: 22, offersMade: 1, profile: MOCK_INVESTOR_PROFILE },
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
  fetchPropertyById: async (id: string): Promise<Property | null> => {
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
                  resolve({...prop});
              }
          }, DELAY_MS);
      });
  },

  /** Create a new property listing (mock). */
  createProperty: async (data: Partial<Property>): Promise<Property> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const newProp = { ...data, id: `prop_${Date.now()}`, status: 'DRAFT', metrics: { arv: 0, estRent: 0, capRate: 0, projectedRoi: 0, rehabEst: 0 }, location: { lat: 34, lng: -118 }, images: ['https://picsum.photos/800/600'] } as Property;
              MOCK_PROPERTIES.push(newProp);
              resolve(newProp);
          }, DELAY_MS);
      });
  },

  // --- Auth ---
  /** Sign in a user with email and password. */
  signIn: async (email: string, password: string): Promise<{ user: User, token: string }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'error@test.com') return reject('Invalid credentials');
        MOCK_USER = {
          id: 'u_123',
          email,
          firstName: 'John',
          lastName: 'Doe',
          role: email.includes('admin') ? 'ADMIN' : 'USER',
          company: 'Acme Investments'
        };
        resolve({ user: MOCK_USER, token: 'mock_jwt_token_123' });
      }, DELAY_MS);
    });
  },

  /** Register a new user. */
  signUp: async (data: any): Promise<{ user: User, token: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_USER = { id: 'u_124', email: data.email, firstName: data.firstName, lastName: data.lastName, role: 'USER' };
        resolve({ user: MOCK_USER, token: 'mock_jwt_token_124' });
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
              id: `o${Date.now()}`,
              propertyId: offerData.propertyId!,
              userId: MOCK_USER?.id || 'u_guest',
              userName: `${MOCK_USER?.firstName} ${MOCK_USER?.lastName}`,
              offerAmount: offerData.offerAmount!,
              earnestMoney: offerData.earnestMoney!,
              timelineDays: offerData.timelineDays!,
              notes: offerData.notes,
              status: 'SUBMITTED',
              timestamp: new Date().toISOString()
          };
          MOCK_OFFERS.push(newOffer);
          MOCK_ACTIVITY.push({
              id: `a${Date.now()}`,
              propertyId: newOffer.propertyId,
              type: 'OFFER',
              description: `New offer submitted by ${newOffer.userName}`,
              timestamp: new Date().toISOString()
          });
          resolve(newOffer);
      }, 1000));
  },

  /** Accept an offer, rejecting others for the same property. */
  acceptOffer: async (offerId: string): Promise<Offer> => {
      return new Promise(resolve => setTimeout(() => {
          const offer = MOCK_OFFERS.find(o => o.id === offerId);
          if (offer) {
              offer.status = 'ACCEPTED';
              // Reject others
              MOCK_OFFERS.forEach(o => {
                  if (o.propertyId === offer.propertyId && o.id !== offerId) o.status = 'REJECTED';
              });
              MOCK_ACTIVITY.push({
                  id: `a${Date.now()}`,
                  propertyId: offer.propertyId,
                  type: 'CONTRACT',
                  description: `Offer from ${offer.userName} accepted. Deal moving to contract.`,
                  timestamp: new Date().toISOString()
              });
          }
          resolve(offer!);
      }, 800));
  },

  // --- Activity ---
  /** Fetch activity history for a property. */
  fetchActivity: async (propertyId: string): Promise<ActivityEvent[]> => {
      return new Promise(resolve => setTimeout(() => {
          resolve(MOCK_ACTIVITY.filter(a => a.propertyId === propertyId).sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
      }, DELAY_MS));
  },

  // --- Transactions ---
  /** Fetch transaction steps for a property. */
  fetchTransactionSteps: async (propertyId: string): Promise<TransactionStep[]> => {
      return new Promise(resolve => setTimeout(() => {
          // Default steps if none exist
          if (!MOCK_TRANSACTION_STEPS[propertyId]) {
             MOCK_TRANSACTION_STEPS[propertyId] = [
                { id: 't1', label: 'Offer Accepted', status: 'COMPLETE', assignedTo: 'SYSTEM', completedAt: new Date(Date.now() - 500000000).toISOString() },
                { id: 't2', label: 'Earnest Money Received', status: 'PENDING', assignedTo: 'SYSTEM' },
                { id: 't3', label: 'Contract Signed', status: 'PENDING', assignedTo: 'INVESTOR' },
                { id: 't4', label: 'Title Opened', status: 'PENDING', assignedTo: 'AGENT' },
                { id: 't5', label: 'Inspection', status: 'PENDING', assignedTo: 'INVESTOR' },
                { id: 't6', label: 'Closing', status: 'PENDING', assignedTo: 'SYSTEM' },
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
              step.status = step.status === 'PENDING' ? 'COMPLETE' : 'PENDING';
              step.completedAt = step.status === 'COMPLETE' ? new Date().toISOString() : undefined;
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
              id: `d${Date.now()}`,
              propertyId,
              name: 'Uploaded Document.pdf', // Mock
              type: 'OTHER',
              status: 'UPLOADED',
              category: 'Misc',
              url: '#',
              updatedAt: new Date().toISOString(),
              uploadedBy: 'User'
          };
          if (!MOCK_DOCUMENTS[propertyId]) MOCK_DOCUMENTS[propertyId] = [];
          MOCK_DOCUMENTS[propertyId].push(newDoc);
          
          MOCK_ACTIVITY.push({
              id: `a${Date.now()}`,
              propertyId,
              type: 'DOCUMENT',
              description: `New document uploaded: ${newDoc.name}`,
              timestamp: new Date().toISOString()
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
                  if(step) {
                      step.status = 'COMPLETE';
                      step.completedAt = new Date().toISOString();
                  }
                  
                  MOCK_ACTIVITY.push({
                      id: `a${Date.now()}`,
                      propertyId: d.propertyId,
                      type: 'DOCUMENT',
                      description: `Document signed: ${d.name}`,
                      timestamp: new Date().toISOString()
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
                  id: `a${Date.now()}`,
                  propertyId,
                  type: 'SERVICE',
                  description: `Service requested: ${service.name}`,
                  timestamp: new Date().toISOString()
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
              id: `m${Date.now()}`,
              conversationId,
              senderRole: role as any,
              senderName: role === 'AGENT' ? 'Sarah Agent' : 'John Doe',
              body,
              createdAt: new Date().toISOString(),
              isRead: false
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
                  id: `c${Date.now()}`,
                  dealId,
                  propertyAddress: prop?.address || 'Property',
                  propertyImage: prop?.image || '',
                  investorId: MOCK_USER?.id || 'u_guest',
                  agentId: 'a_1',
                  lastMessage: '',
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
          if(inv) inv.status = 'UNLOCKED';
          resolve();
      }, 500));
  },

  /** Fetch referral records for agents. */
  fetchReferrals: async (): Promise<ReferralRecord[]> => {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_REFERRALS), DELAY_MS));
  },

  // --- Analytics ---
  /** Fetch analytics data based on role and time range. */
  fetchAnalytics: async (role: 'USER' | 'ADMIN', timeRange: TimeRange): Promise<AnalyticsData> => {
      return new Promise(resolve => setTimeout(() => {
          if (role === 'ADMIN') {
              resolve({
                  kpis: [
                      { label: 'Active Deals', value: '12', change: 2, trend: 'up' },
                      { label: 'Avg Days on Market', value: '24', change: -5, trend: 'down' }, // down is good for DOM
                      { label: 'Offer-to-Close Rate', value: '38%', change: 4, trend: 'up' },
                      { label: 'Total Volume', value: '$8.2M', change: 12, trend: 'up' }
                  ],
                  charts: {
                      main: [
                          { name: 'Jan', value: 2 }, { name: 'Feb', value: 4 }, 
                          { name: 'Mar', value: 3 }, { name: 'Apr', value: 8 }
                      ],
                      secondary: [
                          { name: 'P1', value: 4 }, { name: 'P2', value: 6 }, 
                          { name: 'P3', value: 2 } // offers per deal
                      ],
                      distribution: [
                          { name: 'Published', value: 12 }, { name: 'Under Contract', value: 5 }, 
                          { name: 'Closed', value: 28 }
                      ]
                  },
                  insights: [
                      "Deals with professional photos close 23% faster.",
                      "Investor engagement peaks on Tuesday mornings."
                  ]
              });
          } else {
               resolve({
                  kpis: [
                      { label: 'Deals Viewed', value: '45', change: 10, trend: 'up' },
                      { label: 'Offers Submitted', value: '3', change: 0, trend: 'neutral' },
                      { label: 'Under Contract', value: '1', change: 1, trend: 'up' },
                      { label: 'Closed Deals', value: '0', change: 0, trend: 'neutral' }
                  ],
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
                      "You are most active in the Los Angeles market.",
                      "Properties with >8% Cap Rate match your criteria best."
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
              id: `u${Date.now()}`,
              name: email.split('@')[0],
              email,
              role: role as any,
              status: 'PENDING',
              lastActive: '-'
          };
          MOCK_ORG_USERS.push(newUser);
          resolve(newUser);
      }, 1000));
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

  // --- Rewards ---
  /** Fetch rewards catalog and user history. */
  fetchRewards: async (): Promise<{pointsBalance: number, history: any[], catalog: Reward[]}> => {
      return new Promise(resolve => setTimeout(() => {
          resolve({
              pointsBalance: 12500,
              history: [
                  { id: 'h1', action: 'Closed Deal: 8801 Sunset', points: 10000, date: '2023-12-15' },
                  { id: 'h2', action: 'Referral: New Investor', points: 2500, date: '2024-01-20' },
              ],
              catalog: MOCK_REWARDS
          });
      }, DELAY_MS));
  },

  /** Redeem a specific reward. */
  redeemReward: async (id: string): Promise<Reward> => {
      return new Promise(resolve => setTimeout(() => {
          const reward = MOCK_REWARDS.find(r => r.id === id);
          if(reward) reward.redeemed = true;
          resolve(reward!);
      }, 1000));
  },

  // --- Audit ---
  /** Fetch system audit logs. */
  fetchAuditLogs: async (): Promise<AuditLogEntry[]> => {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_AUDIT_LOGS), DELAY_MS));
  }
};

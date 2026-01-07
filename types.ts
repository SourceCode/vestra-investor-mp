
/**
 * Represents a real estate property listing in the marketplace.
 */
export interface Property {
  /** Unique identifier for the property. */
  id: string;
  /** Street address of the property. */
  address: string;
  /** City where the property is located. */
  city: string;
  /** State abbreviation. */
  state: string;
  /** Postal code. */
  zip: string;
  /** Listing price in USD. */
  price: number;
  /** Number of bedrooms. */
  beds: number;
  /** Number of bathrooms. */
  baths: number;
  /** Interior square footage. */
  sqft: number;
  /** Main display image URL. */
  image: string;
  /** Category of the property. */
  type: 'Single Family' | 'Multi Family' | 'Commercial' | 'Land';
  /** Current workflow status of the deal. */
  status: DealStatus;
  /** Whether live bidding is active for this property. */
  biddingEnabled?: boolean;
  /** Expiration timestamp for the bidding process. */
  biddingEndDate?: string;
  /** The highest current bid amount if bidding is enabled. */
  currentBid?: number;
  /** Descriptive tags for filtering (e.g., 'Fixer', 'Vacant'). */
  tags: string[];
  /** Calculated investment metrics. */
  metrics: {
    /** After Repair Value estimate. */
    arv: number;
    /** Estimated monthly rent. */
    estRent: number;
    /** Capitalization rate percentage. */
    capRate: number;
    /** Projected Return on Investment percentage. */
    projectedRoi: number;
    /** Estimated rehabilitation costs. */
    rehabEst: number;
  };
  /** Marketing description of the property. */
  description: string;
  /** Year the property was constructed. */
  yearBuilt: number;
  /** Geospatial coordinates. */
  location: {
    lat: number;
    lng: number;
  };
  /** Array of image URLs for the gallery. */
  images: string[];
  /** ID of the agent managing this listing. */
  assignedAgentId?: string;
  /** ISO timestamp of creation. */
  createdAt?: string;
  /** Number of times the listing has been viewed. */
  views?: number;
  // Network Fields
  /** Indicates if this deal comes from a partner network. */
  isNetworkDeal?: boolean;
  /** Name of the organization that originated the deal. */
  originatingOrgName?: string;
  /** Logo URL of the originating organization. */
  originatingOrgLogo?: string;
  /** Configuration for deal sharing settings. */
  distribution?: DealDistributionConfig;
}

/**
 * Configuration for sharing deals across the partner network.
 */
export interface DealDistributionConfig {
    /** Whether the deal is visible to the broader network. */
    sharedToNetwork: boolean;
    /** How the referral fee is calculated. */
    referralFeeType: 'PERCENTAGE' | 'FLAT';
    /** The value of the referral fee (percentage or flat amount). */
    referralFeeValue: number;
    /** List of organization IDs allowed to view this deal, or 'ALL'. */
    visibleToOrgs: string[]; 
}

/**
 * Represents the lifecycle stages of a deal.
 */
export type DealStatus = 
  | 'DRAFT' 
  | 'PUBLISHED' 
  | 'INTERESTED' 
  | 'OFFER_SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'OFFER_ACCEPTED' 
  | 'UNDER_CONTRACT' 
  | 'CLOSED' 
  | 'CANCELLED';

/**
 * Represents a user in the system.
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  /** Role determining access permissions. */
  role: 'USER' | 'ADMIN' | 'OWNER';
  company?: string;
  phone?: string;
}

/** Status of an investor's verification profile. */
export type InvestorStatus = 'LOCKED' | 'PENDING' | 'UNLOCKED';

/**
 * Detailed profile information for an investor user.
 */
export interface InvestorProfile {
  status: InvestorStatus;
  criteria: {
    locations: string[];
    strategies: string[];
    minBudget: number;
    maxBudget: number;
    minBeds: number;
    dealTypes: string[];
  };
  disclosuresAccepted: boolean;
  proofOfFundsSubmitted: boolean;
}

/**
 * Summary view of an investor for agent dashboards.
 */
export interface InvestorSummary extends User {
    status: InvestorStatus;
    lastActive: string;
    dealViews: number;
    offersMade: number;
    profile: InvestorProfile;
}

/**
 * Represents a purchase offer on a property.
 */
export interface Offer {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  offerAmount: number;
  earnestMoney: number;
  /** Proposed days to close. */
  timelineDays: number;
  notes?: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  timestamp: string;
}

/**
 * Represents a single event in the activity timeline.
 */
export interface ActivityEvent {
  id: string;
  propertyId: string;
  type: 'VIEW' | 'OFFER' | 'STATUS_CHANGE' | 'CONTRACT' | 'NOTE' | 'DOCUMENT' | 'SERVICE' | 'NETWORK' | 'REWARD';
  description: string;
  timestamp: string;
  userId?: string;
}

// --- Transaction Types ---

/**
 * Represents a milestone step in the transaction closing process.
 */
export interface TransactionStep {
  id: string;
  label: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED';
  assignedTo: 'INVESTOR' | 'AGENT' | 'SYSTEM' | 'SELLER';
  completedAt?: string;
  notes?: string;
}

/**
 * Represents a document associated with a deal.
 */
export interface DealDocument {
  id: string;
  propertyId: string;
  name: string;
  type: 'CONTRACT' | 'DISCLOSURE' | 'TITLE' | 'INSPECTION' | 'FINANCIAL' | 'OTHER';
  status: 'PENDING' | 'UPLOADED' | 'SIGNED' | 'REJECTED';
  category: string;
  url: string; // mock url
  updatedAt: string;
  uploadedBy: string;
  requiresSignature?: boolean;
}

/**
 * Represents an external service integration for a transaction.
 */
export interface ServiceIntegration {
  id: string;
  propertyId: string;
  name: string; // e.g. "First American Title"
  type: 'TITLE' | 'LENDER' | 'INSURANCE';
  status: 'NOT_STARTED' | 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETE';
  contactName?: string;
  contactEmail?: string;
  logo?: string; // FontAwesome icon name or url
}

// --- Messaging Types ---

/**
 * Represents a chat conversation context.
 */
export interface Conversation {
  id: string;
  dealId: string;
  propertyAddress: string;
  propertyImage: string;
  investorId: string;
  agentId: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

/**
 * Represents a single message within a conversation.
 */
export interface Message {
  id: string;
  conversationId: string;
  senderRole: 'USER' | 'AGENT' | 'SYSTEM';
  senderName: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

// --- Notification Types ---
export type NotificationType = 'MESSAGE' | 'OFFER_STATUS' | 'DEAL_STATUS' | 'ACCESS_APPROVED' | 'BID_ALERT';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// --- Agent Types ---
export interface AgentTask {
    id: string;
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'REVIEW' | 'RESPONSE' | 'ACTION';
    due: string;
}

export interface AgentMetrics {
    activeDeals: number;
    pendingOffers: number;
    underContract: number;
    unreadMessages: number;
}

export interface AgentState {
    metrics: AgentMetrics;
    tasks: AgentTask[];
    investors: InvestorSummary[];
    referrals: ReferralRecord[];
    loading: boolean;
}

// --- Analytics Types ---
export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface ChartDataPoint {
    name: string;
    value: number;
    value2?: number; // secondary metric
}

export interface AnalyticsKpi {
    label: string;
    value: string | number;
    change?: number; // percentage change
    trend?: 'up' | 'down' | 'neutral';
}

export interface AnalyticsData {
    kpis: AnalyticsKpi[];
    charts: {
        main: ChartDataPoint[]; // Line/Bar charts
        secondary?: ChartDataPoint[];
        distribution?: ChartDataPoint[]; // Pie charts
    };
    insights: string[];
}

export interface AnalyticsState {
    data: AnalyticsData | null;
    timeRange: TimeRange;
    loading: boolean;
    error: string | null;
}

// --- Organization & Admin Types ---
export interface OrganizationSettings {
    id: string;
    name: string;
    marketplaceName: string;
    supportEmail: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string; // Mock
    currency: string;
    timezone: string;
    defaultCloseDays: number;
}

export interface OrgUser {
    id: string;
    name: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'AGENT' | 'INVESTOR';
    status: 'ACTIVE' | 'PENDING' | 'DEACTIVATED';
    lastActive: string;
}

export interface IntegrationConfig {
    id: string;
    provider: string; // e.g. "Salesforce", "DocuSign"
    category: 'CRM' | 'SIGNATURE' | 'EMAIL' | 'ANALYTICS';
    status: 'CONNECTED' | 'DISCONNECTED';
    lastSync?: string;
}

export interface MarketConfig {
    id: string;
    name: string;
    state: string;
    status: 'ACTIVE' | 'INACTIVE';
    dealCount: number;
}

export interface OrganizationState {
    settings: OrganizationSettings | null;
    users: OrgUser[];
    integrations: IntegrationConfig[];
    markets: MarketConfig[];
    loading: boolean;
    error: string | null;
}

// --- Rewards & Referrals ---
export interface Reward {
    id: string;
    title: string;
    description: string;
    cost: number;
    type: 'DISCOUNT' | 'SERVICE' | 'ACCESS';
    redeemed: boolean;
}

export interface ReferralRecord {
    id: string;
    dealAddress: string;
    partnerOrg: string;
    status: 'PENDING' | 'CLOSED' | 'PAID';
    amount: number;
    date: string;
    type: 'INBOUND' | 'OUTBOUND';
}

export interface RewardsState {
    pointsBalance: number;
    history: { id: string, action: string, points: number, date: string }[];
    catalog: Reward[];
    loading: boolean;
}

// --- Audit & Security ---
export interface AuditLogEntry {
    id: string;
    action: string;
    actor: string; // Name or Email
    role: string;
    target: string; // e.g. "Deal #123"
    timestamp: string;
    ip?: string;
}

export interface AuditState {
    logs: AuditLogEntry[];
    loading: boolean;
}

// --- Feature Flags ---
export interface FeatureFlags {
    newAnalytics: boolean;
    advancedSearch: boolean;
    darkMode: boolean;
    networkDeals: boolean;
}

// --- State Interfaces ---

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface InvestorState {
  profile: InvestorProfile;
  loading: boolean;
  error: string | null;
}

export interface SavedState {
  savedIds: string[];
  loading: boolean;
  error: string | null;
}

export interface FilterState {
  location: string;
  priceMin: number;
  priceMax: number;
  beds: number | null;
  baths: number | null;
  propertyTypes: string[];
  tags: string[];
  includeNetworkDeals: boolean; // New
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'roi_desc';
}

export interface PropertiesState {
  list: Property[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  detail: Property | null;
}

export interface SearchState {
  query: string;
  filters: FilterState;
  viewMode: 'list' | 'map' | 'split';
}

export interface UIState {
  isFilterOpen: boolean;
  isGalleryOpen: boolean;
  isOfferDrawerOpen: boolean;
  isInboxDrawerOpen: boolean;
}

export interface OffersState {
  byDealId: Record<string, Offer[]>;
  loading: boolean;
  submissionStatus: 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR';
}

export interface ActivityState {
  list: ActivityEvent[];
  loading: boolean;
}

export interface TransactionState {
  steps: TransactionStep[];
  loading: boolean;
}

export interface DocumentsState {
    list: DealDocument[];
    loading: boolean;
    uploading: boolean;
}

export interface ServicesState {
    list: ServiceIntegration[];
    loading: boolean;
}

export interface MessagingState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, Message[]>;
  loading: boolean;
}

export interface NotificationsState {
  list: Notification[];
  unreadCount: number;
  loading: boolean;
}

/** Root state for the Redux store. */
export interface RootState {
  properties: PropertiesState;
  search: SearchState;
  ui: UIState;
  auth: AuthState;
  investor: InvestorState;
  saved: SavedState;
  offers: OffersState;
  activity: ActivityState;
  transaction: TransactionState;
  documents: DocumentsState;
  services: ServicesState;
  messaging: MessagingState;
  notifications: NotificationsState;
  agent: AgentState;
  analytics: AnalyticsState;
  organization: OrganizationState;
  rewards: RewardsState;
  audit: AuditState;
}

/** Configuration details for the white-labeled tenant. */
export interface TenantConfig {
  name: string;
  marketplaceName: string;
  logoUrl: string; // simpler for mock
  primaryColor: string;
  supportEmail: string;
}

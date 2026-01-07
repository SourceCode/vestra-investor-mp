
/**
 * Represents a Deal in the internal deal flow system.
 * distinct from specific 'Property' listings, though they share characteristics.
 */
export interface Deal {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  status: DealStatus;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  // Extended fields for UI
  description?: string;
  notes?: string;
}

/**
 * Category of the property.
 */
export enum PropertyType {
  COMMERCIAL = 'Commercial',
  LAND = 'Land',
  MULTI_FAMILY = 'Multi Family',
  SINGLE_FAMILY = 'Single Family'
}

/**
 * Represents a real estate property listing in the marketplace.
 */
export interface Property {
  /** Street address of the property. */
  address: string;
  /** ID of the agent managing this listing. */
  assignedAgentId?: string;
  /** Number of bathrooms. */
  baths: number;
  /** Number of bedrooms. */
  beds: number;
  /** Whether live bidding is active for this property. */
  biddingEnabled?: boolean;
  /** Expiration timestamp for the bidding process. */
  biddingEndDate?: string;
  /** City where the property is located. */
  city: string;
  /** ISO timestamp of creation. */
  createdAt?: string;
  /** The highest current bid amount if bidding is enabled. */
  currentBid?: number;
  /** Marketing description of the property. */
  description: string;
  /** Configuration for deal sharing settings. */
  distribution?: DealDistributionConfig;
  /** Unique identifier for the property. */
  id: string;
  /** Main display image URL. */
  image: string;
  /** Array of image URLs for the gallery. */
  images: string[];
  // Network Fields
  /** Indicates if this deal comes from a partner network. */
  isNetworkDeal?: boolean;
  /** Geospatial coordinates. */
  location: {
    lat: number;
    lng: number;
  };
  /** Calculated investment metrics. */
  metrics: {
    /** After Repair Value estimate. */
    arv: number;
    /** Capitalization rate percentage. */
    capRate: number;
    /** Estimated monthly rent. */
    estRent: number;
    /** Projected Return on Investment percentage. */
    projectedRoi: number;
    /** Estimated rehabilitation costs. */
    rehabEst: number;
  };
  /** Logo URL of the originating organization. */
  originatingOrgLogo?: string;
  /** Name of the organization that originated the deal. */
  originatingOrgName?: string;
  /** Listing price in USD. */
  price: number;
  /** Interior square footage. */
  sqft: number;
  /** State abbreviation. */
  state: string;
  /** Current workflow status of the deal. */
  status: DealStatus;
  /** Descriptive tags for filtering (e.g., 'Fixer', 'Vacant'). */
  tags: string[];
  /** Category of the property. */
  type: PropertyType;
  /** Number of times the listing has been viewed. */
  views?: number;
  /** Year the property was constructed. */
  yearBuilt: number;
  /** Postal code. */
  zip: string;
}

/**
 * Configuration for sharing deals across the partner network.
 */
export interface DealDistributionConfig {
  /** How the referral fee is calculated. */
  referralFeeType: 'FLAT' | 'PERCENTAGE';
  /** The value of the referral fee (percentage or flat amount). */
  referralFeeValue: number;
  /** Whether the deal is visible to the broader network. */
  sharedToNetwork: boolean;
  /** List of organization IDs allowed to view this deal, or 'ALL'. */
  visibleToOrgs: string[];
}

/**
 * Represents the lifecycle stages of a deal.
 */
export enum DealStatus {
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT',
  INTERESTED = 'INTERESTED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_SUBMITTED = 'OFFER_SUBMITTED',
  PUBLISHED = 'PUBLISHED',
  UNDER_CONTRACT = 'UNDER_CONTRACT',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

/**
 * Represents a user in the system.
 */
export interface User {
  avatar?: string;
  company?: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  /** List of organizations the user belongs to. */
  memberships: OrganizationMember[];
  phone?: string;
  /** 
   * @deprecated Use `memberships` and `OrganizationMember.role` instead. 
   * Kept for backward compatibility during refactor, strictly mapped to 'USER' if not admin.
   */
  role: 'ADMIN' | 'OWNER' | 'USER';
}

export interface Organization {
  id: string;
  logo?: string;
  name: string;
  settings?: OrganizationSettings;
  slug: string;
}

export interface Permission {
  action: string;
  description: string;
  id: string;
}

export interface Role {
  description: string;
  id: string;
  name: string;
  permissions: Permission[];
}

export interface OrganizationMember {
  id: string;
  organization: Organization;
  organizationId: string;
  role: Role;
  roleId: string;
  userId: string;
}

/** Status of an investor's verification profile. */
export type InvestorStatus = 'LOCKED' | 'PENDING' | 'UNLOCKED';

/**
 * Detailed profile information for an investor user.
 */
export interface InvestorProfile {
  criteria: {
    dealTypes: string[];
    locations: string[];
    maxBudget: number;
    minBeds: number;
    minBudget: number;
    strategies: string[];
  };
  disclosuresAccepted: boolean;
  proofOfFundsSubmitted: boolean;
  status: InvestorStatus;
}

/**
 * Summary view of an investor for agent dashboards.
 */
export interface InvestorSummary extends User {
  dealViews: number;
  lastActive: string;
  offersMade: number;
  profile: InvestorProfile;
  status: InvestorStatus;
}

/**
 * Represents a purchase offer on a property.
 */
/**
 * Status of an offer.
 */
export enum OfferStatus {
  ACCEPTED = 'ACCEPTED',
  COUNTERED = 'COUNTERED',
  REJECTED = 'REJECTED',
  SUBMITTED = 'SUBMITTED'
}

/**
 * Type of legal contract or document.
 */
export enum ContractType {
  PURCHASE_AGREEMENT = 'PURCHASE_AGREEMENT',
  ASSIGNMENT = 'ASSIGNMENT',
  AMENDMENT = 'AMENDMENT'
}

/**
 * Status of a contract lifecycle.
 */
export enum ContractStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  SIGNED = 'SIGNED',
  VOIDED = 'VOIDED'
}

export interface Contract {
  content: string;
  dealId: string;
  generatedAt: string | Date;
  id: string;
  signedAt?: string | Date;
  status: ContractStatus;
  type: ContractType;
}

/**
 * Represents a purchase offer on a property.
 */
export interface Offer {
  earnestMoney: number;
  id: string;
  notes?: string;
  offerAmount: number;
  propertyId: string;
  status: OfferStatus;
  /** Proposed days to close. */
  timelineDays: number;
  timestamp: string;
  userId: string;
  userName: string;
}

/**
 * Represents a single event in the activity timeline.
 */
export interface ActivityEvent {
  description: string;
  id: string;
  propertyId: string;
  timestamp: string;
  type: 'CONTRACT' | 'DOCUMENT' | 'NETWORK' | 'NOTE' | 'OFFER' | 'REWARD' | 'SERVICE' | 'STATUS_CHANGE' | 'VIEW';
  userId?: string;
}

// --- Transaction Types ---

/**
 * Represents a milestone step in the transaction closing process.
 */

export enum TransactionStepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
  BLOCKED = 'BLOCKED'
}

export enum TransactionRole {
  AGENT = 'AGENT',
  INVESTOR = 'INVESTOR',
  SELLER = 'SELLER',
  SYSTEM = 'SYSTEM'
}

/**
 * Represents a milestone step in the transaction closing process.
 */
export interface TransactionStep {
  assignedTo: TransactionRole;
  completedAt?: string | Date;
  id: string;
  label: string;
  notes?: string;
  status: TransactionStepStatus;
}

/**
 * Represents a document associated with a deal.
 */
export interface DealDocument {
  category: string;
  id: string;
  name: string;
  propertyId: string;
  requiresSignature?: boolean;
  status: 'PENDING' | 'REJECTED' | 'SIGNED' | 'UPLOADED';
  type: 'CONTRACT' | 'DISCLOSURE' | 'FINANCIAL' | 'INSPECTION' | 'OTHER' | 'TITLE';
  updatedAt: string;
  uploadedBy: string;
  url: string; // mock url
}

/**
 * Represents an external service integration for a transaction.
 */
export interface ServiceIntegration {
  contactEmail?: string;
  contactName?: string;
  id: string;
  logo?: string; // FontAwesome icon name or url
  name: string; // e.g. "First American Title"
  propertyId: string;
  status: 'COMPLETE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'REQUESTED';
  type: 'INSURANCE' | 'LENDER' | 'TITLE';
}

// --- Messaging Types ---

/**
 * Represents a chat conversation context.
 */
export interface Conversation {
  agentId: string;
  dealId: string;
  id: string;
  investorId: string;
  lastMessage: string;
  propertyAddress: string;
  propertyImage: string;
  unreadCount: number;
  updatedAt: string;
}

/**
 * Represents a single message within a conversation.
 */
export interface Message {
  body: string;
  conversationId: string;
  createdAt: string;
  id: string;
  isRead: boolean;
  senderName: string;
  senderRole: 'AGENT' | 'SYSTEM' | 'USER';
}

// --- Notification Types ---
export type NotificationType = 'ACCESS_APPROVED' | 'BID_ALERT' | 'DEAL_STATUS' | 'MESSAGE' | 'OFFER_STATUS';

export interface Notification {
  body: string;
  createdAt: string | Date;
  id: string;
  isRead: boolean;
  link?: string;
  title: string;
  type: NotificationType;
}

// --- Agent Types ---
export interface AgentTask {
  due: string;
  id: string;
  priority: 'HIGH' | 'LOW' | 'MEDIUM';
  title: string;
  type: 'ACTION' | 'RESPONSE' | 'REVIEW';
}

export interface AgentMetrics {
  activeDeals: number;
  pendingOffers: number;
  underContract: number;
  unreadMessages: number;
}

export interface AgentState {
  investors: InvestorSummary[];
  loading: boolean;
  metrics: AgentMetrics;
  referrals: ReferralRecord[];
  tasks: AgentTask[];
}

// --- Analytics Types ---
export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number; // secondary metric
}

export interface AnalyticsKpi {
  change?: number; // percentage change
  label: string;
  trend?: 'down' | 'neutral' | 'up';
  value: number | string;
}

export interface AnalyticsData {
  charts: {
    distribution?: ChartDataPoint[]; // Pie charts
    main: ChartDataPoint[]; // Line/Bar charts
    secondary?: ChartDataPoint[];
  };
  insights: string[];
  kpis: AnalyticsKpi[];
}

export interface AnalyticsState {
  data: AnalyticsData | null;
  error: null | string;
  loading: boolean;
  timeRange: TimeRange;
}

// --- Organization & Admin Types ---
export interface OrganizationSettings {
  currency: string;
  defaultCloseDays: number;
  id: string;
  logoUrl?: string; // Mock
  marketplaceName: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  timezone: string;
  crmProvider?: 'SALESFORCE' | 'NONE';
  crmConfig?: {
    instanceUrl: string;
    accessToken: string; // In real app, this would be encrypted/OAuthed
  };
}

export interface OrgUser {
  email: string;
  id: string;
  lastActive: string;
  name: string;
  role: 'ADMIN' | 'AGENT' | 'INVESTOR' | 'OWNER';
  status: 'ACTIVE' | 'DEACTIVATED' | 'PENDING';
}

export interface IntegrationConfig {
  category: 'ANALYTICS' | 'CRM' | 'EMAIL' | 'SIGNATURE';
  id: string;
  lastSync?: string;
  provider: string; // e.g. "Salesforce", "DocuSign"
  status: 'CONNECTED' | 'DISCONNECTED';
}

export interface MarketConfig {
  dealCount: number;
  id: string;
  name: string;
  state: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface OrganizationState {
  error: null | string;
  integrations: IntegrationConfig[];
  loading: boolean;
  markets: MarketConfig[];
  settings: null | OrganizationSettings;
  users: OrgUser[];
}

// --- Rewards & Referrals ---
export interface Reward {
  cost: number;
  description: string;
  id: string;
  redeemed: boolean;
  title: string;
  type: 'ACCESS' | 'DISCOUNT' | 'SERVICE';
}

export interface ReferralRecord {
  amount: number;
  date: string;
  dealAddress: string;
  id: string;
  partnerOrg: string;
  status: 'CLOSED' | 'PAID' | 'PENDING';
  type: 'INBOUND' | 'OUTBOUND';
}

export interface RewardsState {
  catalog: Reward[];
  history: { action: string, date: string; id: string, points: number, }[];
  loading: boolean;
  pointsBalance: number;
}

// --- Audit & Security ---
export interface AuditLogEntry {
  action: string;
  actor: string; // Name or Email
  id: string;
  ip?: string;
  role: string;
  target: string; // e.g. "Deal #123"
  timestamp: string;
}

export interface AuditState {
  loading: boolean;
  logs: AuditLogEntry[];
}

// --- Feature Flags ---
export interface FeatureFlags {
  advancedSearch: boolean;
  darkMode: boolean;
  networkDeals: boolean;
  newAnalytics: boolean;
}

// --- State Interfaces ---

export interface AuthState {
  activeOrganizationId: null | string;
  error: null | string;
  isAuthenticated: boolean;
  loading: boolean;
  token: null | string;
  user: null | User;
}

export interface InvestorState {
  error: null | string;
  loading: boolean;
  profile: InvestorProfile;
}

export interface SavedState {
  error: null | string;
  loading: boolean;
  savedIds: string[];
}

export interface FilterState {
  baths: null | number;
  beds: null | number;
  includeNetworkDeals: boolean; // New
  location: string;
  priceMax: number;
  priceMin: number;
  propertyTypes: string[];
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'roi_desc';
  tags: string[];
}

export interface PropertiesState {
  detail: null | Property;
  error: null | string;
  list: Property[];
  loading: boolean;
  selectedId: null | string;
}

export interface SearchState {
  filters: FilterState;
  query: string;
  viewMode: 'list' | 'map' | 'split';
}

export interface UIState {
  isFilterOpen: boolean;
  isGalleryOpen: boolean;
  isInboxDrawerOpen: boolean;
  isOfferDrawerOpen: boolean;
}

export interface OffersState {
  byDealId: Record<string, Offer[]>;
  loading: boolean;
  submissionStatus: 'ERROR' | 'IDLE' | 'SUBMITTING' | 'SUCCESS';
}

export interface ActivityState {
  list: ActivityEvent[];
  loading: boolean;
}

export interface TransactionState {
  loading: boolean;
  steps: TransactionStep[];
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
  activeConversationId: null | string;
  conversations: Conversation[];
  loading: boolean;
  messagesByConversation: Record<string, Message[]>;
}

export interface NotificationsState {
  list: Notification[];
  loading: boolean;
  unreadCount: number;
}

export interface DealsState {
  list: Deal[];
  loading: boolean;
  error: null | string;
  submitting: boolean;
}

/** Root state for the Redux store. */
export interface RootState {
  activity: ActivityState;
  agent: AgentState;
  analytics: AnalyticsState;
  audit: AuditState;
  auth: AuthState;
  deals: DealsState;
  documents: DocumentsState;
  investor: InvestorState;
  messaging: MessagingState;
  notifications: NotificationsState;
  offers: OffersState;
  organization: OrganizationState;
  properties: PropertiesState;
  rewards: RewardsState;
  saved: SavedState;
  search: SearchState;
  services: ServicesState;
  transaction: TransactionState;
  ui: UIState;
}

/** Configuration details for the white-labeled tenant. */
export interface TenantConfig {
  logoUrl: string; // simpler for mock
  marketplaceName: string;
  name: string;
  primaryColor: string;
  supportEmail: string;
}

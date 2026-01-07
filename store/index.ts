
import { configureStore, createSlice, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all, call, put, takeLatest, debounce, select } from 'redux-saga/effects';
import { 
    Property, FilterState, PropertiesState, SearchState, UIState, AuthState, 
    InvestorState, SavedState, User, InvestorProfile, OffersState, ActivityState, 
    TransactionState, Offer, ActivityEvent, TransactionStep, DealStatus,
    MessagingState, NotificationsState, Conversation, Message, Notification,
    AgentState, AgentMetrics, AgentTask, InvestorSummary, AnalyticsState, TimeRange, AnalyticsData,
    DocumentsState, ServicesState, DealDocument, ServiceIntegration, OrganizationState, OrganizationSettings, OrgUser, IntegrationConfig, MarketConfig,
    RewardsState, Reward, ReferralRecord, AuditState, AuditLogEntry
} from '../types';
import { mockApi } from '../mocks/api';
import { INITIAL_FILTER_STATE } from '../constants';

// --- SLICES ---

/**
 * Search Slice
 * Manages search query string, filters, and view mode (list vs map).
 */
const searchSlice = createSlice({
  name: 'search',
  initialState: { query: '', filters: INITIAL_FILTER_STATE, viewMode: 'split' } as SearchState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => { state.query = action.payload; state.filters.location = action.payload; },
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => { state.filters = { ...state.filters, ...action.payload }; },
    setViewMode: (state, action: PayloadAction<'list' | 'map' | 'split'>) => { state.viewMode = action.payload; },
  },
});

/**
 * Properties Slice
 * Manages list of properties, details of selected property, and loading states.
 */
const propertiesSlice = createSlice({
  name: 'properties',
  initialState: { list: [], selectedId: null, loading: false, error: null, detail: null } as PropertiesState,
  reducers: {
    fetchPropertiesStart: (state) => { state.loading = true; state.error = null; },
    fetchPropertiesSuccess: (state, action: PayloadAction<Property[]>) => { state.list = action.payload; state.loading = false; },
    fetchPropertiesFailure: (state, action: PayloadAction<string>) => { state.error = action.payload; state.loading = false; },
    fetchPropertyDetailStart: (state) => { state.loading = true; state.detail = null; },
    fetchPropertyDetailSuccess: (state, action: PayloadAction<Property>) => { state.detail = action.payload; state.loading = false; },
    fetchPropertyDetailFailure: (state, action: PayloadAction<string>) => { state.error = action.payload; state.loading = false; },
    selectProperty: (state, action: PayloadAction<string | null>) => { state.selectedId = action.payload; },
    updatePropertyStatus: (state, action: PayloadAction<{id: string, status: DealStatus}>) => {
        const p = state.list.find(i => i.id === action.payload.id);
        if(p) p.status = action.payload.status;
        if(state.detail?.id === action.payload.id) state.detail.status = action.payload.status;
    }
  },
});

/**
 * UI Slice
 * Manages global UI states like drawers and modals.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState: { isFilterOpen: false, isGalleryOpen: false, isOfferDrawerOpen: false, isInboxDrawerOpen: false } as UIState,
  reducers: {
    toggleFilter: (state) => { state.isFilterOpen = !state.isFilterOpen; },
    setGalleryOpen: (state, action: PayloadAction<boolean>) => { state.isGalleryOpen = action.payload; },
    setOfferDrawerOpen: (state, action: PayloadAction<boolean>) => { state.isOfferDrawerOpen = action.payload; },
    setInboxDrawerOpen: (state, action: PayloadAction<boolean>) => { state.isInboxDrawerOpen = action.payload; },
  },
});

/**
 * Auth Slice
 * Manages user authentication state.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, isAuthenticated: false, loading: false, error: null } as AuthState,
  reducers: {
    loginRequest: (state, action: PayloadAction<any>) => { state.loading = true; state.error = null; },
    loginSuccess: (state, action: PayloadAction<{ user: User, token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state, action: PayloadAction<string>) => { state.error = action.payload; state.loading = false; },
    logout: (state) => { state.user = null; state.token = null; state.isAuthenticated = false; },
    registerRequest: (state, action: PayloadAction<any>) => { state.loading = true; state.error = null; }
  }
});

/**
 * Investor Slice
 * Manages investor profile and verification status.
 */
const investorSlice = createSlice({
    name: 'investor',
    initialState: {
        profile: { status: 'LOCKED', criteria: { locations: [], strategies: [], minBudget: 0, maxBudget: 2000000, minBeds: 0, dealTypes: [] }, disclosuresAccepted: false, proofOfFundsSubmitted: false },
        loading: false, error: null
    } as InvestorState,
    reducers: {
        fetchProfileRequest: (state) => { state.loading = true; },
        fetchProfileSuccess: (state, action: PayloadAction<InvestorProfile>) => { state.profile = action.payload; state.loading = false; },
        updateProfileRequest: (state, action: PayloadAction<Partial<InvestorProfile>>) => { state.loading = true; },
        updateProfileSuccess: (state, action: PayloadAction<InvestorProfile>) => { state.profile = action.payload; state.loading = false; },
        requestAccess: (state, action: PayloadAction<any>) => { state.loading = true; },
        requestAccessSuccess: (state) => { state.loading = false; state.profile.status = 'PENDING'; }
    }
});

/**
 * Saved Slice
 * Manages list of saved deals for the user.
 */
const savedSlice = createSlice({
    name: 'saved',
    initialState: { savedIds: [], loading: false, error: null } as SavedState,
    reducers: {
        fetchSavedRequest: (state) => { state.loading = true; },
        fetchSavedSuccess: (state, action: PayloadAction<string[]>) => { state.savedIds = action.payload; state.loading = false; },
        toggleSaveRequest: (state, action: PayloadAction<string>) => {
            if (state.savedIds.includes(action.payload)) state.savedIds = state.savedIds.filter(id => id !== action.payload);
            else state.savedIds.push(action.payload);
        },
        toggleSaveSuccess: (state, action: PayloadAction<string[]>) => { state.savedIds = action.payload; }
    }
});

/**
 * Offers Slice
 * Manages offers submitted on deals.
 */
const offersSlice = createSlice({
    name: 'offers',
    initialState: { byDealId: {}, loading: false, submissionStatus: 'IDLE' } as OffersState,
    reducers: {
        fetchOffersRequest: (state, action: PayloadAction<string>) => { state.loading = true; },
        fetchOffersSuccess: (state, action: PayloadAction<{propertyId: string, offers: Offer[]}>) => {
            state.byDealId[action.payload.propertyId] = action.payload.offers;
            state.loading = false;
        },
        submitOfferRequest: (state, action: PayloadAction<Partial<Offer>>) => { state.submissionStatus = 'SUBMITTING'; },
        submitOfferSuccess: (state, action: PayloadAction<Offer>) => {
            if(!state.byDealId[action.payload.propertyId]) state.byDealId[action.payload.propertyId] = [];
            state.byDealId[action.payload.propertyId].push(action.payload);
            state.submissionStatus = 'SUCCESS';
        },
        resetSubmissionStatus: (state) => { state.submissionStatus = 'IDLE'; },
        acceptOfferRequest: (state, action: PayloadAction<string>) => { state.loading = true; }
    }
});

/**
 * Activity Slice
 * Manages the timeline of events for a property.
 */
const activitySlice = createSlice({
    name: 'activity',
    initialState: { list: [], loading: false } as ActivityState,
    reducers: {
        fetchActivityRequest: (state, action: PayloadAction<string>) => { state.loading = true; },
        fetchActivitySuccess: (state, action: PayloadAction<ActivityEvent[]>) => { state.list = action.payload; state.loading = false; },
        addActivity: (state, action: PayloadAction<ActivityEvent>) => { state.list.unshift(action.payload); }
    }
});

/**
 * Transaction Slice
 * Manages closing steps and milestones.
 */
const transactionSlice = createSlice({
    name: 'transaction',
    initialState: { steps: [], loading: false } as TransactionState,
    reducers: {
        fetchStepsRequest: (state, action: PayloadAction<string>) => { state.loading = true; },
        fetchStepsSuccess: (state, action: PayloadAction<TransactionStep[]>) => { state.steps = action.payload; state.loading = false; },
        updateStepRequest: (state, action: PayloadAction<{propertyId: string, stepId: string}>) => { /* optimistic */ },
        updateStepSuccess: (state, action: PayloadAction<TransactionStep[]>) => { state.steps = action.payload; }
    }
});

/**
 * Documents Slice
 * Manages document uploads and signatures.
 */
const documentsSlice = createSlice({
    name: 'documents',
    initialState: { list: [], loading: false, uploading: false } as DocumentsState,
    reducers: {
        fetchDocumentsRequest: (state, action: PayloadAction<string>) => { state.loading = true; },
        fetchDocumentsSuccess: (state, action: PayloadAction<DealDocument[]>) => { state.list = action.payload; state.loading = false; },
        uploadDocumentRequest: (state, action: PayloadAction<{propertyId: string, file: any}>) => { state.uploading = true; },
        uploadDocumentSuccess: (state, action: PayloadAction<DealDocument>) => { state.list.push(action.payload); state.uploading = false; },
        signDocumentRequest: (state, action: PayloadAction<string>) => { state.uploading = true; },
        signDocumentSuccess: (state, action: PayloadAction<DealDocument>) => { 
            const idx = state.list.findIndex(d => d.id === action.payload.id);
            if (idx !== -1) state.list[idx] = action.payload;
            state.uploading = false; 
        }
    }
});

/**
 * Services Slice
 * Manages third-party integrations per deal.
 */
const servicesSlice = createSlice({
    name: 'services',
    initialState: { list: [], loading: false } as ServicesState,
    reducers: {
        fetchServicesRequest: (state, action: PayloadAction<string>) => { state.loading = true; },
        fetchServicesSuccess: (state, action: PayloadAction<ServiceIntegration[]>) => { state.list = action.payload; state.loading = false; },
        requestServiceRequest: (state, action: PayloadAction<{propertyId: string, type: string}>) => { /* optimistic */ },
        requestServiceSuccess: (state, action: PayloadAction<ServiceIntegration>) => {
            const idx = state.list.findIndex(s => s.type === action.payload.type);
            if (idx !== -1) state.list[idx] = action.payload;
        }
    }
});

/**
 * Messaging Slice
 * Manages user chats and conversations.
 */
const messagingSlice = createSlice({
    name: 'messaging',
    initialState: { conversations: [], activeConversationId: null, messagesByConversation: {}, loading: false } as MessagingState,
    reducers: {
        fetchConversationsRequest: (state) => { state.loading = true; },
        fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => { state.conversations = action.payload; state.loading = false; },
        setActiveConversation: (state, action: PayloadAction<string | null>) => { state.activeConversationId = action.payload; },
        fetchMessagesRequest: (state, action: PayloadAction<string>) => { /* silent load */ },
        fetchMessagesSuccess: (state, action: PayloadAction<{conversationId: string, messages: Message[]}>) => {
            state.messagesByConversation[action.payload.conversationId] = action.payload.messages;
        },
        sendMessageRequest: (state, action: PayloadAction<{conversationId: string, body: string}>) => { /* optimistic handled in component mostly, or here */ },
        sendMessageSuccess: (state, action: PayloadAction<Message>) => {
            if (!state.messagesByConversation[action.payload.conversationId]) state.messagesByConversation[action.payload.conversationId] = [];
            state.messagesByConversation[action.payload.conversationId].push(action.payload);
            // Update conversation last message
            const conv = state.conversations.find(c => c.id === action.payload.conversationId);
            if (conv) {
                conv.lastMessage = action.payload.body;
                conv.updatedAt = action.payload.createdAt;
            }
        },
        openConversationForDealRequest: (state, action: PayloadAction<string>) => { state.loading = true; } // dealId
    }
});

/**
 * Notifications Slice
 * Manages user notifications.
 */
const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: { list: [], unreadCount: 0, loading: false } as NotificationsState,
    reducers: {
        fetchNotificationsRequest: (state) => { state.loading = true; },
        fetchNotificationsSuccess: (state, action: PayloadAction<Notification[]>) => { 
            state.list = action.payload; 
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
            state.loading = false; 
        },
        markReadRequest: (state, action: PayloadAction<string>) => {
            const n = state.list.find(i => i.id === action.payload);
            if (n && !n.isRead) {
                n.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        }
    }
});

/**
 * Agent Slice
 * Manages agent dashboard data including tasks, investors, and referrals.
 */
const agentSlice = createSlice({
    name: 'agent',
    initialState: { 
        metrics: { activeDeals: 0, pendingOffers: 0, underContract: 0, unreadMessages: 0 },
        tasks: [],
        investors: [],
        referrals: [],
        loading: false
    } as AgentState,
    reducers: {
        fetchDashboardRequest: (state) => { state.loading = true; },
        fetchDashboardSuccess: (state, action: PayloadAction<{ metrics: AgentMetrics, tasks: AgentTask[] }>) => {
            state.metrics = action.payload.metrics;
            state.tasks = action.payload.tasks;
            state.loading = false;
        },
        fetchInvestorsRequest: (state) => { state.loading = true; },
        fetchInvestorsSuccess: (state, action: PayloadAction<InvestorSummary[]>) => {
            state.investors = action.payload;
            state.loading = false;
        },
        unlockInvestorRequest: (state, action: PayloadAction<string>) => { /* optimistic */ },
        unlockInvestorSuccess: (state, action: PayloadAction<string>) => {
            const inv = state.investors.find(i => i.id === action.payload);
            if(inv) inv.status = 'UNLOCKED';
        },
        fetchReferralsRequest: (state) => { state.loading = true; },
        fetchReferralsSuccess: (state, action: PayloadAction<ReferralRecord[]>) => {
            state.referrals = action.payload;
            state.loading = false;
        }
    }
});

/**
 * Analytics Slice
 * Manages data for analytics dashboards.
 */
const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: { data: null, timeRange: '30d', loading: false, error: null } as AnalyticsState,
    reducers: {
        fetchAnalyticsRequest: (state, action: PayloadAction<{ role: 'USER' | 'ADMIN', range?: TimeRange }>) => { 
            state.loading = true; 
            if(action.payload.range) state.timeRange = action.payload.range;
        },
        fetchAnalyticsSuccess: (state, action: PayloadAction<AnalyticsData>) => { state.data = action.payload; state.loading = false; },
        setTimeRange: (state, action: PayloadAction<TimeRange>) => { state.timeRange = action.payload; }
    }
});

/**
 * Organization Slice
 * Manages tenant settings, branding, and team members.
 */
const organizationSlice = createSlice({
    name: 'organization',
    initialState: { settings: null, users: [], integrations: [], markets: [], loading: false, error: null } as OrganizationState,
    reducers: {
        fetchOrgSettingsRequest: (state) => { state.loading = true; },
        fetchOrgSettingsSuccess: (state, action: PayloadAction<OrganizationSettings>) => { state.settings = action.payload; state.loading = false; },
        updateOrgSettingsRequest: (state, action: PayloadAction<Partial<OrganizationSettings>>) => { state.loading = true; },
        updateOrgSettingsSuccess: (state, action: PayloadAction<OrganizationSettings>) => { state.settings = action.payload; state.loading = false; },
        
        fetchOrgUsersRequest: (state) => { state.loading = true; },
        fetchOrgUsersSuccess: (state, action: PayloadAction<OrgUser[]>) => { state.users = action.payload; state.loading = false; },
        inviteUserRequest: (state, action: PayloadAction<{email: string, role: string}>) => { state.loading = true; },
        inviteUserSuccess: (state, action: PayloadAction<OrgUser>) => { state.users.push(action.payload); state.loading = false; },
        
        fetchIntegrationsRequest: (state) => { state.loading = true; },
        fetchIntegrationsSuccess: (state, action: PayloadAction<IntegrationConfig[]>) => { state.integrations = action.payload; state.loading = false; },
        toggleIntegrationRequest: (state, action: PayloadAction<string>) => { /* optimistic */ },
        toggleIntegrationSuccess: (state, action: PayloadAction<IntegrationConfig>) => {
            const idx = state.integrations.findIndex(i => i.id === action.payload.id);
            if (idx !== -1) state.integrations[idx] = action.payload;
        },

        fetchMarketsRequest: (state) => { state.loading = true; },
        fetchMarketsSuccess: (state, action: PayloadAction<MarketConfig[]>) => { state.markets = action.payload; state.loading = false; },
    }
});

/**
 * Rewards Slice
 * Manages user loyalty points and redemption history.
 */
const rewardsSlice = createSlice({
    name: 'rewards',
    initialState: { pointsBalance: 0, history: [], catalog: [], loading: false } as RewardsState,
    reducers: {
        fetchRewardsRequest: (state) => { state.loading = true; },
        fetchRewardsSuccess: (state, action: PayloadAction<{pointsBalance: number, history: any[], catalog: Reward[]}>) => {
            state.pointsBalance = action.payload.pointsBalance;
            state.history = action.payload.history;
            state.catalog = action.payload.catalog;
            state.loading = false;
        },
        redeemRewardRequest: (state, action: PayloadAction<string>) => { state.loading = true; },
        redeemRewardSuccess: (state, action: PayloadAction<Reward>) => {
            state.pointsBalance -= action.payload.cost;
            const item = state.catalog.find(r => r.id === action.payload.id);
            if(item) item.redeemed = true;
            state.history.unshift({
                id: `h_new_${Date.now()}`,
                action: `Redeemed: ${action.payload.title}`,
                points: -action.payload.cost,
                date: new Date().toISOString().split('T')[0]
            });
            state.loading = false;
        }
    }
});

/**
 * Audit Slice
 * Manages security audit logs.
 */
const auditSlice = createSlice({
    name: 'audit',
    initialState: { logs: [], loading: false } as AuditState,
    reducers: {
        fetchAuditLogsRequest: (state) => { state.loading = true; },
        fetchAuditLogsSuccess: (state, action: PayloadAction<AuditLogEntry[]>) => {
            state.logs = action.payload;
            state.loading = false;
        }
    }
});

// --- SAGAS ---

/** Fetches properties based on search filters. */
function* fetchPropertiesSaga(action: any): Generator<any, void, any> {
  try {
    yield put(propertiesSlice.actions.fetchPropertiesStart());
    const data = yield call(mockApi.fetchProperties, action.payload);
    yield put(propertiesSlice.actions.fetchPropertiesSuccess(data));
  } catch (error) {
    yield put(propertiesSlice.actions.fetchPropertiesFailure('Failed'));
  }
}

/** Fetches detailed property info and associated context (offers, activity, docs). */
function* fetchPropertyDetailSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield put(propertiesSlice.actions.fetchPropertyDetailStart());
    const data = yield call(mockApi.fetchPropertyById, action.payload);
    yield put(propertiesSlice.actions.fetchPropertyDetailSuccess(data));
    // Also fetch context
    yield put(offersSlice.actions.fetchOffersRequest(action.payload));
    yield put(activitySlice.actions.fetchActivityRequest(action.payload));
    if (data.status === 'UNDER_CONTRACT' || data.status === 'OFFER_ACCEPTED' || data.status === 'CLOSED') {
        yield put(transactionSlice.actions.fetchStepsRequest(action.payload));
        yield put(documentsSlice.actions.fetchDocumentsRequest(action.payload));
        yield put(servicesSlice.actions.fetchServicesRequest(action.payload));
    }
  } catch (error) {
    yield put(propertiesSlice.actions.fetchPropertyDetailFailure('Error'));
  }
}

/** Handles user login and initial data bootstrapping. */
function* loginSaga(action: PayloadAction<any>): Generator<any, void, any> {
    try {
        const response = yield call(mockApi.signIn, action.payload.email, action.payload.password);
        yield put(authSlice.actions.loginSuccess(response));
        yield put(investorSlice.actions.fetchProfileRequest());
        yield put(savedSlice.actions.fetchSavedRequest());
        yield put(messagingSlice.actions.fetchConversationsRequest());
        yield put(notificationsSlice.actions.fetchNotificationsRequest());
        yield put(rewardsSlice.actions.fetchRewardsRequest());
        // If admin, fetch dashboard & org settings
        if (response.user.role === 'ADMIN' || response.user.role === 'OWNER') {
            yield put(agentSlice.actions.fetchDashboardRequest());
            yield put(organizationSlice.actions.fetchOrgSettingsRequest());
        }
    } catch (e: any) {
        yield put(authSlice.actions.loginFailure(e.toString()));
    }
}

/** Submits a new offer and updates property status. */
function* submitOfferSaga(action: PayloadAction<Partial<Offer>>): Generator<any, void, any> {
    const offer = yield call(mockApi.submitOffer, action.payload);
    yield put(offersSlice.actions.submitOfferSuccess(offer));
    yield put(propertiesSlice.actions.updatePropertyStatus({id: offer.propertyId, status: 'OFFER_SUBMITTED'}));
    yield put(activitySlice.actions.fetchActivityRequest(offer.propertyId)); // refresh activity
}

/** Accepts an offer, updates property status, and triggers transaction flow. */
function* acceptOfferSaga(action: PayloadAction<string>): Generator<any, void, any> {
    const offer = yield call(mockApi.acceptOffer, action.payload);
    yield put(offersSlice.actions.fetchOffersRequest(offer.propertyId)); // reload offers
    yield put(propertiesSlice.actions.updatePropertyStatus({id: offer.propertyId, status: 'OFFER_ACCEPTED'}));
    yield put(mockApi.updatePropertyStatus, offer.propertyId, 'OFFER_ACCEPTED'); // Persist mock
    yield put(transactionSlice.actions.fetchStepsRequest(offer.propertyId));
}

/** Updates the status of a transaction step. */
function* transactionSaga(action: PayloadAction<{propertyId: string, stepId: string}>): Generator<any, void, any> {
    const steps = yield call(mockApi.updateTransactionStep, action.payload.propertyId, action.payload.stepId);
    yield put(transactionSlice.actions.updateStepSuccess(steps));
}

// Documents Sagas
function* fetchDocumentsSaga(action: PayloadAction<string>): Generator<any, void, any> {
    const docs = yield call(mockApi.fetchDocuments, action.payload);
    yield put(documentsSlice.actions.fetchDocumentsSuccess(docs));
}

function* uploadDocumentSaga(action: PayloadAction<{propertyId: string, file: any}>): Generator<any, void, any> {
    const doc = yield call(mockApi.uploadDocument, action.payload.propertyId, action.payload.file);
    yield put(documentsSlice.actions.uploadDocumentSuccess(doc));
    yield put(activitySlice.actions.addActivity({
        id: `a_${Date.now()}`,
        propertyId: action.payload.propertyId,
        type: 'DOCUMENT',
        description: `Document uploaded: ${doc.name}`,
        timestamp: new Date().toISOString()
    }));
}

function* signDocumentSaga(action: PayloadAction<string>): Generator<any, void, any> {
    const doc = yield call(mockApi.signDocument, action.payload);
    yield put(documentsSlice.actions.signDocumentSuccess(doc));
    yield put(transactionSlice.actions.fetchStepsRequest(doc.propertyId));
    yield put(activitySlice.actions.addActivity({
        id: `a_${Date.now()}`,
        propertyId: doc.propertyId,
        type: 'DOCUMENT',
        description: `Document signed: ${doc.name}`,
        timestamp: new Date().toISOString()
    }));
}

// Services Sagas
function* fetchServicesSaga(action: PayloadAction<string>): Generator<any, void, any> {
    const services = yield call(mockApi.fetchServices, action.payload);
    yield put(servicesSlice.actions.fetchServicesSuccess(services));
}

function* requestServiceSaga(action: PayloadAction<{propertyId: string, type: string}>): Generator<any, void, any> {
    const service = yield call(mockApi.requestService, action.payload.propertyId, action.payload.type);
    yield put(servicesSlice.actions.requestServiceSuccess(service));
    yield put(activitySlice.actions.addActivity({
        id: `a_${Date.now()}`,
        propertyId: action.payload.propertyId,
        type: 'SERVICE',
        description: `Service requested: ${service.name}`,
        timestamp: new Date().toISOString()
    }));
}

// Messaging Sagas
function* fetchConversationsSaga(): Generator<any, void, any> {
    const convs = yield call(mockApi.fetchConversations);
    yield put(messagingSlice.actions.fetchConversationsSuccess(convs));
}

function* fetchMessagesSaga(action: PayloadAction<string>): Generator<any, void, any> {
    const msgs = yield call(mockApi.fetchMessages, action.payload);
    yield put(messagingSlice.actions.fetchMessagesSuccess({ conversationId: action.payload, messages: msgs }));
}

function* sendMessageSaga(action: PayloadAction<{conversationId: string, body: string}>): Generator<any, void, any> {
    const user = yield select((state: RootState) => state.auth.user);
    const msg = yield call(mockApi.sendMessage, action.payload.conversationId, action.payload.body, user?.role || 'USER');
    yield put(messagingSlice.actions.sendMessageSuccess(msg));
}

function* openConversationSaga(action: PayloadAction<string>): Generator<any, void, any> {
    const conv = yield call(mockApi.getOrCreateConversation, action.payload);
    yield put(messagingSlice.actions.fetchConversationsRequest()); // refresh list
    yield put(messagingSlice.actions.setActiveConversation(conv.id));
    yield put(uiSlice.actions.setInboxDrawerOpen(true));
    yield put(messagingSlice.actions.fetchMessagesRequest(conv.id));
}

// Notification Sagas
function* fetchNotificationsSaga(): Generator<any, void, any> {
    const list = yield call(mockApi.fetchNotifications);
    yield put(notificationsSlice.actions.fetchNotificationsSuccess(list));
}

function* markNotificationReadSaga(action: PayloadAction<string>): Generator<any, void, any> {
    yield call(mockApi.markNotificationRead, action.payload);
}

// Agent Sagas
function* fetchAgentDashboardSaga(): Generator<any, void, any> {
    const metrics = yield call(mockApi.fetchAgentMetrics);
    const tasks = yield call(mockApi.fetchAgentTasks);
    yield put(agentSlice.actions.fetchDashboardSuccess({ metrics, tasks }));
}

function* fetchInvestorsSaga(): Generator<any, void, any> {
    const list = yield call(mockApi.fetchInvestors);
    yield put(agentSlice.actions.fetchInvestorsSuccess(list));
}

function* unlockInvestorSaga(action: PayloadAction<string>): Generator<any, void, any> {
    yield call(mockApi.unlockInvestor, action.payload);
    yield put(agentSlice.actions.unlockInvestorSuccess(action.payload));
}

function* fetchReferralsSaga(): Generator<any, void, any> {
    const data = yield call(mockApi.fetchReferrals);
    yield put(agentSlice.actions.fetchReferralsSuccess(data));
}

// Analytics Sagas
function* fetchAnalyticsSaga(action: PayloadAction<{ role: 'USER' | 'ADMIN', range: TimeRange }>): Generator<any, void, any> {
    const data = yield call(mockApi.fetchAnalytics, action.payload.role, action.payload.range);
    yield put(analyticsSlice.actions.fetchAnalyticsSuccess(data));
}

// Organization Sagas
function* fetchOrgSettingsSaga(): Generator<any, void, any> {
    const settings = yield call(mockApi.fetchOrgSettings);
    yield put(organizationSlice.actions.fetchOrgSettingsSuccess(settings));
}

function* updateOrgSettingsSaga(action: PayloadAction<Partial<OrganizationSettings>>): Generator<any, void, any> {
    const settings = yield call(mockApi.updateOrgSettings, action.payload);
    yield put(organizationSlice.actions.updateOrgSettingsSuccess(settings));
}

function* fetchOrgUsersSaga(): Generator<any, void, any> {
    const users = yield call(mockApi.fetchOrgUsers);
    yield put(organizationSlice.actions.fetchOrgUsersSuccess(users));
}

function* inviteUserSaga(action: PayloadAction<{email: string, role: string}>): Generator<any, void, any> {
    const user = yield call(mockApi.inviteUser, action.payload.email, action.payload.role);
    yield put(organizationSlice.actions.inviteUserSuccess(user));
}

function* fetchIntegrationsSaga(): Generator<any, void, any> {
    const list = yield call(mockApi.fetchIntegrations);
    yield put(organizationSlice.actions.fetchIntegrationsSuccess(list));
}

function* toggleIntegrationSaga(action: PayloadAction<string>): Generator<any, void, any> {
    const item = yield call(mockApi.toggleIntegration, action.payload);
    yield put(organizationSlice.actions.toggleIntegrationSuccess(item));
}

function* fetchMarketsSaga(): Generator<any, void, any> {
    const list = yield call(mockApi.fetchMarkets);
    yield put(organizationSlice.actions.fetchMarketsSuccess(list));
}

// Rewards Sagas
function* fetchRewardsSaga(): Generator<any, void, any> {
    const data = yield call(mockApi.fetchRewards);
    yield put(rewardsSlice.actions.fetchRewardsSuccess(data));
}

function* redeemRewardSaga(action: PayloadAction<string>): Generator<any, void, any> {
    const reward = yield call(mockApi.redeemReward, action.payload);
    yield put(rewardsSlice.actions.redeemRewardSuccess(reward));
}

// Audit Sagas
function* fetchAuditLogsSaga(): Generator<any, void, any> {
    const logs = yield call(mockApi.fetchAuditLogs);
    yield put(auditSlice.actions.fetchAuditLogsSuccess(logs));
}

/** Root Saga aggregating all watchers. */
function* rootSaga() {
  yield debounce(500, searchSlice.actions.setFilters.type, fetchPropertiesSaga);
  yield debounce(500, searchSlice.actions.setQuery.type, function* (action: any) { yield call(fetchPropertiesSaga, { payload: { location: action.payload } }); });
  yield takeLatest('PROPERTIES_FETCH_REQUESTED', fetchPropertiesSaga);
  yield takeLatest('PROPERTY_DETAIL_REQUESTED', fetchPropertyDetailSaga);
  
  yield takeLatest(authSlice.actions.loginRequest.type, loginSaga);
  yield takeLatest(authSlice.actions.registerRequest.type, function* (action:any) { yield call(mockApi.signUp, action.payload); });
  
  yield takeLatest(investorSlice.actions.fetchProfileRequest.type, function* () { const p = yield call(mockApi.fetchInvestorProfile); yield put(investorSlice.actions.fetchProfileSuccess(p)); });
  yield takeLatest(investorSlice.actions.updateProfileRequest.type, function* (a:any) { const p = yield call(mockApi.updateInvestorProfile, a.payload); yield put(investorSlice.actions.updateProfileSuccess(p)); });
  yield takeLatest(investorSlice.actions.requestAccess.type, function* (a:any) { yield call(mockApi.requestAccess, a.payload); yield put(investorSlice.actions.requestAccessSuccess()); });

  yield takeLatest(savedSlice.actions.fetchSavedRequest.type, function* () { const ids = yield call(mockApi.fetchSavedDeals); yield put(savedSlice.actions.fetchSavedSuccess(ids)); });
  yield takeLatest(savedSlice.actions.toggleSaveRequest.type, function* (a:any) { const ids = yield call(mockApi.toggleSaveDeal, a.payload); yield put(savedSlice.actions.toggleSaveSuccess(ids)); });

  yield takeLatest(offersSlice.actions.fetchOffersRequest.type, function* (a:any) { const offers = yield call(mockApi.fetchOffers, a.payload); yield put(offersSlice.actions.fetchOffersSuccess({propertyId: a.payload, offers})); });
  yield takeLatest(offersSlice.actions.submitOfferRequest.type, submitOfferSaga);
  yield takeLatest(offersSlice.actions.acceptOfferRequest.type, acceptOfferSaga);

  yield takeLatest(activitySlice.actions.fetchActivityRequest.type, function* (a:any) { const list = yield call(mockApi.fetchActivity, a.payload); yield put(activitySlice.actions.fetchActivitySuccess(list)); });
  
  yield takeLatest(transactionSlice.actions.fetchStepsRequest.type, function* (a:any) { const steps = yield call(mockApi.fetchTransactionSteps, a.payload); yield put(transactionSlice.actions.fetchStepsSuccess(steps)); });
  yield takeLatest(transactionSlice.actions.updateStepRequest.type, transactionSaga);

  yield takeLatest(documentsSlice.actions.fetchDocumentsRequest.type, fetchDocumentsSaga);
  yield takeLatest(documentsSlice.actions.uploadDocumentRequest.type, uploadDocumentSaga);
  yield takeLatest(documentsSlice.actions.signDocumentRequest.type, signDocumentSaga);

  yield takeLatest(servicesSlice.actions.fetchServicesRequest.type, fetchServicesSaga);
  yield takeLatest(servicesSlice.actions.requestServiceRequest.type, requestServiceSaga);

  yield takeLatest(messagingSlice.actions.fetchConversationsRequest.type, fetchConversationsSaga);
  yield takeLatest(messagingSlice.actions.fetchMessagesRequest.type, fetchMessagesSaga);
  yield takeLatest(messagingSlice.actions.sendMessageRequest.type, sendMessageSaga);
  yield takeLatest(messagingSlice.actions.openConversationForDealRequest.type, openConversationSaga);

  yield takeLatest(notificationsSlice.actions.fetchNotificationsRequest.type, fetchNotificationsSaga);
  yield takeLatest(notificationsSlice.actions.markReadRequest.type, markNotificationReadSaga);

  yield takeLatest(agentSlice.actions.fetchDashboardRequest.type, fetchAgentDashboardSaga);
  yield takeLatest(agentSlice.actions.fetchInvestorsRequest.type, fetchInvestorsSaga);
  yield takeLatest(agentSlice.actions.unlockInvestorRequest.type, unlockInvestorSaga);
  yield takeLatest(agentSlice.actions.fetchReferralsRequest.type, fetchReferralsSaga);

  yield takeLatest(analyticsSlice.actions.fetchAnalyticsRequest.type, fetchAnalyticsSaga);

  yield takeLatest(organizationSlice.actions.fetchOrgSettingsRequest.type, fetchOrgSettingsSaga);
  yield takeLatest(organizationSlice.actions.updateOrgSettingsRequest.type, updateOrgSettingsSaga);
  yield takeLatest(organizationSlice.actions.fetchOrgUsersRequest.type, fetchOrgUsersSaga);
  yield takeLatest(organizationSlice.actions.inviteUserRequest.type, inviteUserSaga);
  yield takeLatest(organizationSlice.actions.fetchIntegrationsRequest.type, fetchIntegrationsSaga);
  yield takeLatest(organizationSlice.actions.toggleIntegrationRequest.type, toggleIntegrationSaga);
  yield takeLatest(organizationSlice.actions.fetchMarketsRequest.type, fetchMarketsSaga);

  yield takeLatest(rewardsSlice.actions.fetchRewardsRequest.type, fetchRewardsSaga);
  yield takeLatest(rewardsSlice.actions.redeemRewardRequest.type, redeemRewardSaga);

  yield takeLatest(auditSlice.actions.fetchAuditLogsRequest.type, fetchAuditLogsSaga);
}

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: combineReducers({
    search: searchSlice.reducer,
    properties: propertiesSlice.reducer,
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
    investor: investorSlice.reducer,
    saved: savedSlice.reducer,
    offers: offersSlice.reducer,
    activity: activitySlice.reducer,
    transaction: transactionSlice.reducer,
    documents: documentsSlice.reducer,
    services: servicesSlice.reducer,
    messaging: messagingSlice.reducer,
    notifications: notificationsSlice.reducer,
    agent: agentSlice.reducer,
    analytics: analyticsSlice.reducer,
    organization: organizationSlice.reducer,
    rewards: rewardsSlice.reducer,
    audit: auditSlice.reducer
  }),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export const { setQuery, setFilters, setViewMode } = searchSlice.actions;
export const { selectProperty } = propertiesSlice.actions;
export const { toggleFilter, setGalleryOpen, setOfferDrawerOpen, setInboxDrawerOpen } = uiSlice.actions;
export const { loginRequest, logout, registerRequest } = authSlice.actions;
export const { updateProfileRequest, requestAccess } = investorSlice.actions;
export const { toggleSaveRequest } = savedSlice.actions;
export const { submitOfferRequest, acceptOfferRequest, resetSubmissionStatus } = offersSlice.actions;
export const { updateStepRequest } = transactionSlice.actions;
export const { setActiveConversation, sendMessageRequest, openConversationForDealRequest, fetchConversationsRequest, fetchMessagesRequest } = messagingSlice.actions;
export const { markReadRequest } = notificationsSlice.actions;
export const { fetchDashboardRequest, fetchInvestorsRequest, unlockInvestorRequest, fetchReferralsRequest } = agentSlice.actions;
export const { fetchAnalyticsRequest, setTimeRange } = analyticsSlice.actions;
export const { fetchDocumentsRequest, uploadDocumentRequest, signDocumentRequest } = documentsSlice.actions;
export const { fetchServicesRequest, requestServiceRequest } = servicesSlice.actions;
export const { fetchOrgSettingsRequest, updateOrgSettingsRequest, fetchOrgUsersRequest, inviteUserRequest, fetchIntegrationsRequest, toggleIntegrationRequest, fetchMarketsRequest } = organizationSlice.actions;
export const { fetchRewardsRequest, redeemRewardRequest } = rewardsSlice.actions;
export const { fetchAuditLogsRequest } = auditSlice.actions;

export const fetchProperties = (filters: FilterState) => ({ type: 'PROPERTIES_FETCH_REQUESTED', payload: filters });
export const fetchPropertyDetail = (id: string) => ({ type: 'PROPERTY_DETAIL_REQUESTED', payload: id });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

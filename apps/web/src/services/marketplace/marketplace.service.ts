import { AppDataSource } from '../../db/data-source';
import { Deal } from '../../db/entities/Deal.entity';
import { Media, MediaType } from '../../db/entities/Media.entity';
import { Property, PropertyType, DealStatus } from '../../types';

export class MarketplaceService {
    private dealRepo = AppDataSource.getRepository(Deal);
    private mediaRepo = AppDataSource.getRepository(Media);

    /**
     * Retrieves all PUBLISHED deals as Marketplace Properties.
     */
    async getListings(filters?: any): Promise<Property[]> {
        const publishedDeals = await this.dealRepo.find({
            where: { status: DealStatus.PUBLISHED },
            relations: ['organization', 'createdBy']
        });

        // In a real app, we'd do a more efficient join or batched query for media
        const listings = await Promise.all(publishedDeals.map(async (deal) => {
            const media = await this.mediaRepo.find({
                where: { entityType: MediaType.DEAL, entityId: deal.id }
            });

            return this.mapDealToProperty(deal, media);
        }));

        return listings;
    }

    /**
     * Retrieves a single property listing by ID.
     */
    async getListing(id: string): Promise<Property | null> {
        const deal = await this.dealRepo.findOne({
            where: { id, status: DealStatus.PUBLISHED },
            relations: ['organization', 'createdBy']
        });

        if (!deal) return null;

        const media = await this.mediaRepo.find({
            where: { entityType: MediaType.DEAL, entityId: deal.id }
        });

        return this.mapDealToProperty(deal, media);
    }

    /**
     * Maps an internal Deal entity to a public Property listing.
     */
    private mapDealToProperty(deal: Deal, media: Media[]): Property {
        const mainImage = media.length > 0 ? `/uploads/${media[0].filename}` : 'https://picsum.photos/400/300';
        const images = media.map(m => `/uploads/${m.filename}`);

        return {
            id: deal.id,
            address: deal.address,
            assignedAgentId: deal.createdById, // Map agent ID
            city: deal.city || '',
            state: deal.state || '',
            zip: deal.zip || '',
            price: Number(deal.price) || 0,
            beds: deal.beds || 0,
            baths: Number(deal.baths) || 0,
            sqft: deal.sqft || 0,
            yearBuilt: deal.yearBuilt || 0,
            description: deal.description || '',
            type: (deal.propertyType as PropertyType) || PropertyType.SINGLE_FAMILY,
            status: deal.status as any, // Cast to match Property interface if needed, or update types
            images: images,
            image: mainImage,
            tags: [], // Could be added to Deal entity later
            location: { lat: 0, lng: 0 }, // Would need geocoding
            metrics: {
                arv: 0,
                capRate: 0,
                estRent: 0,
                projectedRoi: 0,
                rehabEst: 0
            },
            originatingOrgName: deal.organization?.name,
            originatingOrgLogo: deal.organization?.logo
        };
    }
}

export const marketplaceService = new MarketplaceService();

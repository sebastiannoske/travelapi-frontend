export class TravelSubmission {
    constructor(
        public submitData: {
            city?: string;
            contactEmail?: string;
            contactName?: string;
            cost?: number;
            departureTime?: string;
            description?: string;
            lat?: number;
            link?: string;
            long?: number;
            organisation?: string;
            phoneNumber?: string;
            passenger?: number;
            postcode?: string;
            streetAddress?: string;
            transportationMeanId?: number;
            travelType?: 'offer' | 'request';
            userAddress?: string;
            userEmail?: string;
            userCity?: string;
            userName?: string;
            userPhoneNumber?: string;
            userPostCode?: string;
        },
        public destinationId: number
    ) {}
}

export class TravelSubmission {
    constructor(
        public city?: string,
        public contactEmail?: string,
        public contactName?: string,
        public cost?: number,
        public departureTime?: string,
        public description?: string,
        public lat?: number,
        public link?: string,
        public long?: number,
        public organisation?: string,
        public phoneNumber?: string,
        public passenger?: number,
        public postcode?: string,
        public streetAddress?: string,
        public transportationMeanId?: number,
        public travelType?: 'offer' | 'request',
        public userAddress?: string,
        public userEmail?: string,
        public userCity?: string,
        public userName?: string,
        public userPhoneNumber?: string,
        public userPostCode?: string
    ) {}
}

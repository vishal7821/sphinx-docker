
/**
 * The model class holds the upload details
 */
export class Upload {

    constructor(
        public id: number,
        public upload_id: number,
        public confidence: number,
        public image: string,
        public roll_number: string,
    ) { }
}
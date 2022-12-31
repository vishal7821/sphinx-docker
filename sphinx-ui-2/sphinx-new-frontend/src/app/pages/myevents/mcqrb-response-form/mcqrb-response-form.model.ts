export class McqrbResponseForm {
    labelText: any;
    optionText: any;
    is_Correct: any;
    id: any;

    constructor(labelText:any,optionText:any, is_Correct:any) {
        this.labelText= labelText;
        this.optionText = optionText;
        this.is_Correct = is_Correct;
    }
}

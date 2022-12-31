export class McqcbQuestionForm {
    labelText: any;
    optionText: any;
    is_Correct: any;
    id: any;

    constructor(labelText:any, optionText:any, is_correct: any) {
        this.labelText = labelText;
        this.optionText = optionText;
        this.is_Correct = is_correct;
    }
}

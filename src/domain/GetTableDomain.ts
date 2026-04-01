export class StudyRecord {
    constructor(
        public id: string,
        public studyContent: string,
        public studyTime: string,
    ) { }
    public static newStudyRecord(
        id: string,
        studyContent: string,
        studyTime: string,
    ): StudyRecord {
        return new StudyRecord(
            id,
            studyContent,
            studyTime,
        )
    }
}
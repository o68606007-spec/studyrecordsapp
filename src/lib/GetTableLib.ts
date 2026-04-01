import { supabase } from "../utils/supabase"
import { StudyRecord } from "../domain/GetTableDomain"

export async function GetAllRecords() {
    const response = await supabase.from("study-record").select("*");
    if (response.error) {
        throw new Error(response.error.message);
    }
    const recordData = response.data.map((data) => {
        return StudyRecord.newStudyRecord(data.id, data.studyContent, data.studyTime)
    });
    return recordData;
}
import { useCallback, useEffect, useState } from 'react'
import { Button, Stack, Table } from '@chakra-ui/react'

import { GetAllRecords } from './lib/GetTableLib';
import { StudyRecord } from "./domain/GetTableDomain";
import {Dialogs} from "./components/organism/Dialog"
import { supabase } from './utils/supabase';

function App() {
  const [loading, setLoading] = useState(true);
  const [studyRecords, setStudyRecord] = useState<StudyRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<StudyRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdd = async () => {
    const data = await GetAllRecords();
    setStudyRecord(data);
    setEditingRecord(null);
  }

  const onUpdateClick = useCallback(async (id: string) => {
    const selectData = await supabase.from("study-record").select('*').eq('id', id).single();
    if (selectData.error) {
      throw new Error(selectData.error.message);
    }
    setEditingRecord(selectData.data);
    setIsDialogOpen(true);
  },[])

  const onDeleteClick = useCallback(async (id: string) => {
    const deleteData = await supabase.from("study-record").delete().eq('id', id)
    if (deleteData.error) {
      throw new Error(deleteData.error.message);
    }
    const data = await GetAllRecords();
    setStudyRecord(data);
  }, [])

  useEffect(() => {
    const getAllRecords = async () => {
      const data = await GetAllRecords();
      setStudyRecord(data);
      setLoading(false);
    }
    getAllRecords();
  }, [])

  if (loading) {
    return <p data-testid="loading">Loading</p>
  }

  return (
    <>
      <h1 data-testid="title">学習記録一覧</h1>
      <Button variant="outline" width="100px" data-testid="addbutton" onClick={() => {
        setEditingRecord(null);
        setIsDialogOpen(true);
      }}>登録</Button>
      <Dialogs onAdd={handleAdd} open={isDialogOpen} setOpen={setIsDialogOpen} initialData={editingRecord} />
      <Stack gap="10" data-testid="table">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>学習内容</Table.ColumnHeader>
                <Table.ColumnHeader>学習時間</Table.ColumnHeader>                 
              </Table.Row>
            </Table.Header>
            <Table.Body data-testid="tablelist">
              {studyRecords.map((studyRecord) => (
                <Table.Row key={studyRecord.id} data-testid="data-item">
                  <Table.Cell>{studyRecord.studyContent}</Table.Cell>
                  <Table.Cell>{studyRecord.studyTime}</Table.Cell>
                  <Table.Cell>
                    <Button onClick={() => onUpdateClick(studyRecord.id)} data-testid="updatebutton">編集</Button>
                  </Table.Cell>
                  <Table.Cell>
                    <Button onClick={() => onDeleteClick(studyRecord.id)} data-testid="deletebutton">削除</Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
    </Stack>
    </>
  )
}

export default App

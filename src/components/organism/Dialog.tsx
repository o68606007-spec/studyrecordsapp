import { FC, memo, useCallback, useState, useEffect } from "react";
import { Button, Input, Group, Dialog, Portal, CloseButton, useDisclosure } from '@chakra-ui/react';
import { useForm } from "react-hook-form";
import { supabase } from "../../utils/supabase";
import { StudyRecord } from "../../domain/GetTableDomain";

type Props = {
    onAdd: () => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    initialData: StudyRecord | null;
}

type FormValues = {
    studyContent: string;
    studyTime: string;
}

export const Dialogs: FC<Props> = memo((prop) => {
    const { onAdd, open, setOpen, initialData } = prop
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();

    const onOpenChange = (event) => {
        setOpen(event.open);
    }
    const onSubmit = useCallback(async (data: FormValues) => {
        if (initialData) {
            const updateData = await supabase.from("study-record").update({studyContent: data.studyContent, studyTime: data.studyTime ? Number(data.studyTime) : null}).eq('id', initialData.id);
            if (updateData.error) {
                throw new Error(updateData.error.message);
            }
        } else {
            const registerData = await supabase.from("study-record").insert([{studyContent: data.studyContent, studyTime: data.studyTime ? Number(data.studyTime) :null}]);
            if (registerData.error) {
                throw new Error(registerData.error.message);
            }
        }
        onAdd()
        setOpen(false);
        reset();
        }, [onAdd, setOpen, initialData, reset])

    useEffect(() => {
        if (initialData) {
            reset({
                studyContent: initialData.studyContent,
                studyTime: initialData.studyTime,
            });
        } else {
            reset({
                studyContent: "",
                studyTime: "0",
            })
        }
    }, [initialData, reset]);


    return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content as="form" onSubmit={handleSubmit(onSubmit)}>
                    <Dialog.Header>
                        <Dialog.Title data-testid="add-title">{initialData ? "記録編集": "新規学習記録"}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Group attached w="fall" maxW="lg">
                            <Input type="text" {...register("studyContent", {required:"内容の入力は必須です",})} data-testid="content-input"/>
                            {errors.studyContent && <p style={{color : "red"}} data-testid="studycontent-error">{errors.studyContent.message}</p>}
                            <Input type="number" {...register("studyTime", {required: "時間の入力は必須です", min: {value: 0, message: "時間は0以上である必要があります"}})} data-testid="time-input"/>
                            {errors.studyTime && <p style={{color : "red"}} data-testid="studytime-error">{errors.studyTime.message}</p>}
                        </Group>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button colorScheme="teal" width="100px" type="submit">登録</Button>                        
                        <Dialog.ActionTrigger asChild>
                            <Button colorScheme="teal" width="100px">キャンセル</Button>
                        </Dialog.ActionTrigger>                            
                    </Dialog.Footer>
                    <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog.Root>
    )
})
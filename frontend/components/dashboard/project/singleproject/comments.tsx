import type { FC } from 'react';
import { getComments } from '@/actions/projects';
import CommentsWrapper from './comments-wrapper'; // Adjust this import based on your auth setup
import { getUserDetail } from '@/actions/settings';

interface Props {
    SourcingProjectId: string;
}

const Comments: FC<Props> = async ({ SourcingProjectId }) => {
    const comments = await getComments({ project_id: SourcingProjectId });
    const user_promise = getUserDetail();

    return (
        <CommentsWrapper
            initialComments={comments ?? []}
            projectId={SourcingProjectId}
            user_promise={user_promise}
        />
    );
};

export default Comments;

import React from 'react';
import { Skeleton, Card, CardContent } from '@mui/material';

const SkeletonImovel: React.FC = () => {
    return (
        <Card sx={{ width: 300, borderRadius: 4, backgroundColor: '#dff0d8' }}>
            <Skeleton variant="rectangular" height={160} />
            <CardContent>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="text" width="80%" height={20} />
            </CardContent>
        </Card>
    );
};

export default SkeletonImovel;

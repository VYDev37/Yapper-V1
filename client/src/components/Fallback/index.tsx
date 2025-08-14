import { Route } from 'react-router-dom';

import NotFound from './404';

export default function FallbackRoutes() {
    return (
        <>
            <Route path="*" element={<NotFound />} />
        </>
    );
}
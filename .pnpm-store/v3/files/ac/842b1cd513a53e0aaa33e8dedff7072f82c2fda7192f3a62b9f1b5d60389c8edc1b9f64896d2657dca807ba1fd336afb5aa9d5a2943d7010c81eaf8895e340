import { useContext } from 'react';
import { CloseNotificationContext } from './CloseNotificationContext';
export var useCloseNotification = function () {
    var closeNotification = useContext(CloseNotificationContext);
    if (!closeNotification) {
        throw new Error('useCloseNotification must be used within a CloseNotificationContext.Provider');
    }
    return closeNotification;
};
//# sourceMappingURL=useCloseNotification.js.map
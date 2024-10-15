#import "NotificationService.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNNotificationRequest *receivedRequest;
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.receivedRequest = request;
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];

    NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"com.galaxies.swiper"];

    NSInteger count = [[defaults valueForKey:@"count"] integerValue];
    if (self.bestAttemptContent != nil) {
        NSInteger receivedBadge = [self.bestAttemptContent.badge integerValue];
        
        if (count == 0) {
            if (receivedBadge > 0) {
                count = receivedBadge;
            }
        } else {
            count += 1;
        }
        
        self.bestAttemptContent.badge = @(count);
        [defaults setInteger:count forKey:@"count"];
        
        self.contentHandler(self.bestAttemptContent);
    } else {
        self.contentHandler(self.bestAttemptContent);
    }
}

- (void)serviceExtensionTimeWillExpire {
    self.contentHandler(self.bestAttemptContent);
}

@end

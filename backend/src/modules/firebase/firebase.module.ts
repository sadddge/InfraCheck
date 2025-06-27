import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'FIREBASE_ADMIN',
            useFactory: (cfg: ConfigService) => {
                const existing = admin.apps.length
                    ? admin.app()
                    : admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId: cfg.get('PROJECT_ID'),
                            clientEmail: cfg.get('CLIENT_EMAIL'),
                            privateKey: cfg
                                .get('PRIVATE_KEY')
                                .replace(/\\n/g, '\n'),
                        }),
                        projectId: cfg.get('PROJECT_ID'),
                    });
                return existing;
            },
            inject: [ConfigService],
        },
    ],
    exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule { }

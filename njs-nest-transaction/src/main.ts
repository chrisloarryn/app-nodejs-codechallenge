import 'reflect-metadata';

import { HttpExceptionFilter } from './api/exception/http-exceptions.filter';
import { AppModule } from './app.module';
import { LoggerConfig } from './config';
import { varMsjApp } from './enum';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';

import { KAFKA_BROKER_CONSUMER_GROUP_ID_TRANSACTION, KAFKA_CONSUMER_CLIENTID } from '@api/constant/kafka.constant';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
declare const module: any;

async function bootstrap() {
	const logger: LoggerConfig = new LoggerConfig();
	const winstonLogger = WinstonModule.createLogger(logger.console());

	const app = await NestFactory.create(AppModule, {
		logger: winstonLogger,
		snapshot: true,
		cors: false,
	});

	// Configuración de CORS
  app.enableCors({
    origin: '*', // Cambia '*' por el origen permitido de tus solicitudes (ej. 'http://localhost:3000')
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
	
	const configService = app.get(ConfigService);
	const brokersStr = configService.get<string>('kafka.brokers');
	const brokers = brokersStr.split(',');

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.KAFKA,
		options: {
			client: {
				brokers,
				clientId: KAFKA_CONSUMER_CLIENTID,
			},
			consumer: {
				groupId: KAFKA_BROKER_CONSUMER_GROUP_ID_TRANSACTION,
			},
			subscribe: {
				fromBeginning: true,
			},
		},
	});

	winstonLogger.log(varMsjApp.APP_WELCOME_MESSAGE);
	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
	app.setGlobalPrefix(process.env.GLOBAL_PREFIX || varMsjApp.APP_DEFAULT_GLOBAL_PREFIX);

	const configSwagger = new DocumentBuilder()
		.setTitle(process.env.SWAGGER_NAME || varMsjApp.APP_DEFAULT_SWAGGER_NAME)
		.setDescription(process.env.SWAGGER_DESCRIPTION || varMsjApp.APP_DEFAULT_SWAGGER_DESCRIPTION)
		.setVersion(process.env.SWAGGER_VERSION || varMsjApp.APP_DEFAULT_SWAGGER_VERSION)
		.setContact(
			process.env.SWAGGER_CONTACT_NAME || varMsjApp.APP_DEFAULT_SWAGGER_CONTACT_NAME,
			'',
			process.env.SWAGGER_CONTACT_EMAIL || varMsjApp.APP_DEFAULT_SWAGGER_CONTACT_EMAIL,
		)
		.build();

	if (process.env.NODE_ENV !== 'production') {
		const document = SwaggerModule.createDocument(app, configSwagger);
		SwaggerModule.setup(
			process.env.GLOBAL_PREFIX || `${varMsjApp.APP_DEFAULT_GLOBAL_PREFIX}/${process.env.SWAGGER_URL}` || varMsjApp.APP_DEFAULT_SWAGGER_URL,
			app,
			document,
		);
	}

	const port = configService.get<number>('app.port');

	winstonLogger.log(`The App port: ${port}`, 'bootstrap');

	if (!port) {
		throw new Error('Port is not defined');
	} else {
		await app.startAllMicroservices();
		await app.listen(port)
	}

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
}

bootstrap();

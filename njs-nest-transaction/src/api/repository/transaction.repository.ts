import { CreateTransactionDto } from '@api/dto';
import { Transaction, TransactionStatusGraphQL } from '@api/entity';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { MessageStatusEnum } from 'src/enum/message-status.enum';

export enum PdfCartolasGenerationKind {
	GENERATE = 'generated',
	SAMPLE = 'sample',
}

@Injectable()
export class TransactionRepository {
	constructor(@InjectModel(Transaction.name) private readonly model: Model<Transaction>) {}

	async create(transaction: CreateTransactionDto): Promise<Transaction> {
		try {
			const createdTransaction = new this.model(transaction);
			return await createdTransaction.save();
		} catch (error) {
			Logger.log('error', TransactionRepository.name);
			console.trace(error);
			throw new BadRequestException(error);
		}
	}

	async update(transactionId: string, transaction: Transaction): Promise<Transaction | null> {
		const transactionFound = this.model.findById(transactionId);
		if (!transactionFound) {
			return null;
		}

		transactionFound.set(transaction.toObject());

		await this.model.updateOne({ _id: transactionId }, transactionFound);

		return transactionFound;
	}

	async find(): Promise<Transaction[]> {
		return this.model.find();
	}

	async updateTransactionState(id: string, status: MessageStatusEnum): Promise<Transaction | null> {
		const transaction = await this.model.findById(id);
		if (!transaction) {
			return null;
		}

		transaction.transactionStatus = status;

		return await transaction.save();
	}

	async findOneById(transactionId: string): Promise<Transaction | null> {
		const transaction = await this.model.findById(transactionId);
		if (!transaction) {
			return null;
		}
		return transaction;
	}

	async findOneByExternalId(externalId: string): Promise<Transaction | null> {
		const transaction = await this.model.findOne({ transactionExternalId: externalId });
		if (!transaction) {
			return null;
		}
		return transaction;
	}

	async findOneByStatusEntity(status: TransactionStatusGraphQL, tranferTypeId: number): Promise<Transaction | null> {
		const { transactionStatus, createdAt, transactionId, transactionType, value } = status;

		const query = { 
			transactionStatus: transactionStatus.name,
			tranferTypeId,
			_id: new ObjectId(transactionId),
			value,
			createdAt: {
				// A date-time string at UTC, such as  "2023-08-06T18:16:17.187Z", compliant with the date-time format.
				$eq: dayjs(createdAt).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
			},
		}

		Logger.log(`[${TransactionRepository.name}] - Query: ${JSON.stringify(query)}`, TransactionRepository.name);

		const transaction = await this.model.findOne(query);

		if (!transaction) {
			return null;
		}

		return transaction;
	}
}
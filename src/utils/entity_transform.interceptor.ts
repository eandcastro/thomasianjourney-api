import { EntityDTO, wrap } from '@mikro-orm/core';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class EntityTransformInterceptor<T, K> implements NestInterceptor {
  transform(data: EntityDTO<T> | EntityDTO<T>[]): K | K[] {
    return data as K;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<K | K[]> | Promise<Observable<K | K[]>> {
    return next.handle().pipe(
      map((data: T) => {
        let raw: EntityDTO<T> | EntityDTO<T>[];

        if (Array.isArray(data)) {
          raw = data.map((item) => wrap<T>(item).toObject());
        } else {
          raw = wrap<T>(data).toObject();
        }

        return this.transform(raw);
      }),
    );
  }
}

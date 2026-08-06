# Panduan Pembuatan Modul Baru (Developer Guide)
# MODULE_GUIDE.md

Version : 3.0.0
Status : Production / Documentation
Last Updated : 2026-07-07

Panduan ini bertujuan untuk memberikan arahan langkah-demi-langkah bagi pengembang dalam membangun fitur atau modul bisnis fungsional baru (misalnya: Akademik, Keuangan, PPDB, atau Boarding) menggunakan pola **Clean Architecture + Domain-Driven Design (DDD)** yang terstandarisasi pada sistem ini.

---

## 📌 GAMBARAN UMUM STRUKTUR MODUL
Setiap modul fungsional baru harus diletakkan di dalam folder `/src/modules/<nama-modul>/`. Struktur folder internal untuk sebuah modul idealnya adalah:

```bash
src/modules/boarding/           # Nama modul: Boarding (Asrama)
├── domain/                     # Layer Domain (Spesifik Modul)
│   ├── room.entity.ts          # Entitas bisnis murni kamar asrama
│   └── room.repository.ts      # Antarmuka kontrak repository kamar
├── application/                # Layer Kasus Penggunaan (Use Case)
│   ├── room.service.ts         # Logika koordinasi & transaksi kamar
│   └── room.validator.ts       # Skema Zod validator input kamar
└── presentation/               # Layer Penyajian API
    └── room.controller.ts      # HTTP Controller untuk rute kamar
```

---

## 🛠️ LANGKAH-LANGKAH MEMBUAT MODUL BARU

Kita akan mengambil contoh pembuatan modul **Room (Kamar Asrama)** di dalam domain Boarding.

### Langkah 1: Definisikan Tipe Data di `/src/types/index.ts`
Pastikan Anda mendefinisikan properti data entity terlebih dahulu agar type-safe secara global.
```typescript
export interface RoomProps {
  id?: string;
  name: string;
  capacity: number;
  blockName: string; // contoh: "Gedung Al-Azhar"
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Langkah 2: Buat Entitas Domain (`room.entity.ts`)
Tulis entitas bisnis murni di `/src/modules/boarding/domain/room.entity.ts` dengan mewarisi `BaseEntity`.
```typescript
import { BaseEntity } from '../../../domain/entity.base';
import { RoomProps } from '../../../types';

export class RoomEntity extends BaseEntity<RoomProps> {
  constructor(props: RoomProps) {
    super(props);
  }

  // Tulis aturan bisnis murni (Domain Invariant) di sini
  public validateCapacity(): boolean {
    if (this.props.capacity <= 0) {
      throw new Error("Kapasitas kamar tidak boleh kurang dari atau sama dengan nol.");
    }
    return true;
  }

  public changeCapacity(newCapacity: number): void {
    this.props.capacity = newCapacity;
    this.validateCapacity();
    this.props.updatedAt = new Date();
  }
}
```

### Langkah 3: Buat Antarmuka Repositori (`room.repository.ts`)
Buat kontrak repositori di `/src/modules/boarding/domain/room.repository.ts` mewarisi `IBaseRepository`.
```typescript
import { IBaseRepository } from '../../../domain/repository.interface';
import { RoomEntity } from './room.entity';

export interface IRoomRepository extends IBaseRepository<RoomEntity> {
  // Tambahkan query spesifik kamar di sini jika ada (contoh: cari kamar kosong)
  findAvailableRooms(tenantId: string): Promise<RoomEntity[]>;
}
```

### Langkah 4: Implementasikan Layanan Aplikasi (`room.service.ts`)
Tulis use-case bisnis di `/src/modules/boarding/application/room.service.ts` mewarisi `BaseService`.
```typescript
import { BaseService } from '../../../application/service.base';
import { IRoomRepository } from '../domain/room.repository';
import { RoomEntity } from '../domain/room.entity';
import { RoomProps } from '../../../types';

export class RoomService extends BaseService {
  private roomRepo: IRoomRepository;

  constructor(roomRepo: IRoomRepository) {
    super();
    this.roomRepo = roomRepo;
  }

  public async registerNewRoom(data: RoomProps, tenantId: string): Promise<RoomEntity> {
    return this.executeSafe('RoomService.registerNewRoom', async () => {
      const room = new RoomEntity(data);
      room.validateCapacity();
      
      // Simpan menggunakan repository terisolasi tenant
      return await this.roomRepo.create(room, tenantId);
    });
  }

  public async getRoomsList(tenantId: string): Promise<RoomEntity[]> {
    return this.executeSafe('RoomService.getRoomsList', async () => {
      return await this.roomRepo.findMany({}, tenantId);
    });
  }
}
```

### Langkah 5: Buat Skema Validasi Input (`room.validator.ts`)
Buat skema pengaman di `/src/modules/boarding/application/room.validator.ts`.
```typescript
import { z } from 'zod';

export const CreateRoomSchema = z.object({
  name: z.string().min(3, "Nama kamar minimal berisi 3 karakter."),
  capacity: z.number().int().positive("Kapasitas harus berupa angka positif."),
  blockName: z.string().min(3, "Nama gedung minimal berisi 3 karakter.")
});
```

### Langkah 6: Implementasikan HTTP Controller (`room.controller.ts`)
Tulis controller di `/src/modules/boarding/presentation/room.controller.ts` mewarisi `BaseController`.
```typescript
import { BaseController } from '../../../presentation/controller.base';
import { RoomService } from '../application/room.service';
import { RouterRequest, RouterResponse } from '../../../presentation/router';
import { CreateRoomSchema } from '../application/room.validator';

export class RoomController extends BaseController {
  private roomService: RoomService;

  constructor(roomService: RoomService) {
    super();
    this.roomService = roomService;
  }

  public async create(req: RouterRequest, res: RouterResponse): Promise<void> {
    const tenantId = req.tenantId || '';
    
    // Validasi input body terhadap skema Zod
    const validatedData = this.validate(CreateRoomSchema, req.body);
    
    const newRoom = await this.roomService.registerNewRoom(validatedData, tenantId);
    
    this.sendSuccess(res, newRoom.toObject(), "Kamar baru berhasil ditambahkan.", 201);
  }

  public async list(req: RouterRequest, res: RouterResponse): Promise<void> {
    const tenantId = req.tenantId || '';
    const rooms = await this.roomService.getRoomsList(tenantId);
    const roomsObject = rooms.map(r => r.toObject());
    
    this.sendSuccess(res, roomsObject, "Daftar kamar berhasil ditarik.");
  }
}
```

### Langkah 7: Registrasi DI Container & Routing Terpusat

1.  **Daftarkan instansi kelas ke Dependency Container:**
    Buat file baru `/src/modules/boarding/boarding.module.ts` atau tambahkan ke level bootstrap proyek:
    ```typescript
    import { container } from '../../core/di';
    import { BaseRepository } from '../../domain/repository.base';
    import { RoomEntity } from './domain/room.entity';
    import { IRoomRepository } from './domain/room.repository';
    import { RoomService } from './application/room.service';
    import { RoomController } from './presentation/room.controller';

    // Buat adapter repository in-memory (mock) terlebih dahulu
    export class RoomRepositoryMock extends BaseRepository<RoomEntity> implements IRoomRepository {
      public async findAvailableRooms(tenantId: string): Promise<RoomEntity[]> {
        return await this.findMany({ filter: (r) => r.toObject().capacity > 0 }, tenantId);
      }
    }

    const roomRepo = new RoomRepositoryMock();
    const roomService = new RoomService(roomRepo);
    const roomController = new RoomController(roomService);

    // Registrasikan ke container DI agar siap disuntikkan ke modul lain
    container.register('IRoomRepository', roomRepo);
    container.register('RoomService', roomService);
    container.register('RoomController', roomController);
    ```

2.  **Daftarkan Rute pada Rantai Routing (`/src/presentation/routes.ts`):**
    Hubungkan endpoint API ke router Express kustom agar siap dikonsumsi oleh Client:
    ```typescript
    import { container } from '../core/di';
    import { RoomController } from '../modules/boarding/presentation/room.controller';
    
    // Selesaikan controller dari container DI
    const roomController = container.resolve<RoomController>('RoomController');

    // Pada baris register routes
    router.post('/api/v1/boarding/rooms', (req, res) => roomController.create(req, res));
    router.get('/api/v1/boarding/rooms', (req, res) => roomController.list(req, res));
    ```

---

## 🏆 KESIMPULAN & DISIPLIN IMPLEMENTASI
Dengan mengikuti pola modular di atas:
*   Kode Anda akan sepenuhnya terisolasi dan mudah diuji secara modular (Unit Testing).
*   Pertukaran data dijamin aman dan seragam di level API.
*   Pemisahan aturan multi-tenancy dijamin berjalan otomatis dan aman dari kebocoran data antar pesantren.

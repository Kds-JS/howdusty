import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('contributors')
export class Contributor {
  @PrimaryColumn()
  id: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column({ name: 'avatar_url' })
  avatarUrl: string;
}

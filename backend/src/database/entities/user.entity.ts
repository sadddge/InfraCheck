import { Role } from "src/common/enums/roles.enums";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Report } from "./report.entity";
import { Comment } from "./comment.entity";
import { Message } from "./message.entity";
import { Vote } from "./vote.entity";
@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: true })
    active: boolean;

    @Column({ unique: true})
    number: string;
    
    @Column()
    password: string;
    
    @Column()
    name: string;

    @Column( {
        name: "last_name",
    })
    lastName: string;

    @Column({
        type: "enum",
        enum: Role,
        default: Role.NEIGHBOR,
    })
    role : Role

    @OneToMany(() => Report, (report) => report.creator)
    reports: Report[];

    @OneToMany(() => Comment, (comment) => comment.creator)
    comments: Comment[];

    @OneToMany(() => Message, (message) => message.sender)
    messages: Message[];

    @OneToMany(() => Vote, (vote) => vote.user)
    votes: Vote[];

    @ManyToMany(() => Report, (report) => report.followers)
    @JoinTable({
        name: "user_reports_followed",
        joinColumn: {
            name: "user_id",
            referencedColumnName: "id",
        },
        inverseJoinColumn: {
            name: "report_id",
            referencedColumnName: "id",
        },
    })
    reportsFollowed: Report[];
}
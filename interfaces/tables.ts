export interface UserData {
	UserID: number
	Salt: Buffer,
	HashedPass: Buffer
}

export interface RawTreeTable {
	TreeName: string,
	TreeDescription: string,
	CreatedAt: string
}

export interface TreeTable {
	TreeName: string,
	TreeDescription: string,
	CreatedAt: Date
}
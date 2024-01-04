package model

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

type Note struct {
	ID        bson.ObjectId `bson:"_id,omitempty" json:"id"`
	UserID    bson.ObjectId `bson:"user_id" json:"user_id"`
	Title     string        `bson:"title" json:"title"`
	Content   string        `bson:"content" json:"content"`
	Shared    bool          `bson:"shared" json:"shared"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time     `bson:"updated_at" json:"updated_at"`
}

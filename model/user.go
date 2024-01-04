package model

import "gopkg.in/mgo.v2/bson"

type User struct {
	ID       bson.ObjectId `bson:"_id,omitempty" json:"id"`
	Username string        `bson:"username" json:"username"`
	Password string        `bson:"password" json:"-"`
}

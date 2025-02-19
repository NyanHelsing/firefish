//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.12

use super::sea_orm_active_enums::UserProfileFfvisibilityEnum;
use super::sea_orm_active_enums::UserProfileMutingnotificationtypesEnum;
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "user_profile")]
pub struct Model {
    #[sea_orm(column_name = "userId", primary_key, auto_increment = false, unique)]
    pub user_id: String,
    pub location: Option<String>,
    pub birthday: Option<String>,
    pub description: Option<String>,
    #[sea_orm(column_type = "JsonBinary")]
    pub fields: Json,
    pub url: Option<String>,
    pub email: Option<String>,
    #[sea_orm(column_name = "emailVerifyCode")]
    pub email_verify_code: Option<String>,
    #[sea_orm(column_name = "emailVerified")]
    pub email_verified: bool,
    #[sea_orm(column_name = "twoFactorTempSecret")]
    pub two_factor_temp_secret: Option<String>,
    #[sea_orm(column_name = "twoFactorSecret")]
    pub two_factor_secret: Option<String>,
    #[sea_orm(column_name = "twoFactorEnabled")]
    pub two_factor_enabled: bool,
    pub password: Option<String>,
    #[sea_orm(column_name = "clientData", column_type = "JsonBinary")]
    pub client_data: Json,
    #[sea_orm(column_name = "autoAcceptFollowed")]
    pub auto_accept_followed: bool,
    #[sea_orm(column_name = "alwaysMarkNsfw")]
    pub always_mark_nsfw: bool,
    #[sea_orm(column_name = "carefulBot")]
    pub careful_bot: bool,
    #[sea_orm(column_name = "userHost")]
    pub user_host: Option<String>,
    #[sea_orm(column_name = "securityKeysAvailable")]
    pub security_keys_available: bool,
    #[sea_orm(column_name = "usePasswordLessLogin")]
    pub use_password_less_login: bool,
    #[sea_orm(column_name = "pinnedPageId", unique)]
    pub pinned_page_id: Option<String>,
    #[sea_orm(column_type = "JsonBinary")]
    pub room: Json,
    #[sea_orm(column_name = "injectFeaturedNote")]
    pub inject_featured_note: bool,
    #[sea_orm(column_name = "enableWordMute")]
    pub enable_word_mute: bool,
    #[sea_orm(column_name = "mutedWords", column_type = "JsonBinary")]
    pub muted_words: Json,
    #[sea_orm(column_name = "mutingNotificationTypes")]
    pub muting_notification_types: Vec<UserProfileMutingnotificationtypesEnum>,
    #[sea_orm(column_name = "noCrawle")]
    pub no_crawle: bool,
    #[sea_orm(column_name = "receiveAnnouncementEmail")]
    pub receive_announcement_email: bool,
    #[sea_orm(column_name = "emailNotificationTypes", column_type = "JsonBinary")]
    pub email_notification_types: Json,
    #[sea_orm(column_name = "mutedInstances", column_type = "JsonBinary")]
    pub muted_instances: Json,
    #[sea_orm(column_name = "publicReactions")]
    pub public_reactions: bool,
    #[sea_orm(column_name = "ffVisibility")]
    pub ff_visibility: UserProfileFfvisibilityEnum,
    #[sea_orm(column_name = "moderationNote")]
    pub moderation_note: String,
    #[sea_orm(column_name = "preventAiLearning")]
    pub prevent_ai_learning: bool,
    #[sea_orm(column_name = "isIndexable")]
    pub is_indexable: bool,
    #[sea_orm(column_name = "mutedPatterns")]
    pub muted_patterns: Vec<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::page::Entity",
        from = "Column::PinnedPageId",
        to = "super::page::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    Page,
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    User,
}

impl Related<super::page::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Page.def()
    }
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

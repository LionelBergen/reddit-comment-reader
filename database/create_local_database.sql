DROP DATABASE IF EXISTS reddit_comment_reader;

CREATE DATABASE reddit_comment_reader;
\c reddit_comment_reader;

CREATE TABLE public."RegexpCommentHandle" (
	"Handle" text NOT NULL UNIQUE,
    "type" text NOT NULL
);

INSERT INTO public."RegexpCommentHandle"("Handle", "type") VALUES ('Agree-with-you', 'Reddit');

CREATE TABLE public."RegexpComment" (
    "SubredditMatch" text DEFAULT '.*'::text NOT NULL,
    "CommentMatch" text NOT NULL,
    "ReplyMessage" text NOT NULL,
    "IsReplyRegexp" boolean DEFAULT false,
    id integer NOT NULL,
    "Handle" text NOT NULL
);

/*
 * Taken records from actual database. copy, paste then find/replace with 
 *  regexp find:  ^"(.*?)"\t"(.*?)"\t"(.*?)"\t(true|false)\t([0-9]+)\t"(.*?)"$
 *  replace with: INSERT INTO public."RegexpComment"\("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle"\) VALUES \(WZ983!!!\1WZ983!!!\, WZ983!!!\2WZ983!!!\, WZ983!!!\3WZ983!!!\, \4\, \5\, WZ983!!!\6WZ983!!!\);
 *  then replace ' with ''
 *  then replace WZ983!!! with '
*/
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('^(?!theydidthemath)', '^/r/theydidthemath$', '/r/theydidthemonstermath', false, 109, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '^(?i)(no you|no u|nou)$', 'No you both', false, 110, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '^(?i)((it|its|it''s|it is|this|that) (impossible|not likley|not possible|isn''t possible|is not possible|isnt possible))', 'I agree, this does not seem possible.', false, 111, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '^(?i)((yeah|ya|yea|yes)?( )?((this|it|that|I) (seems|is) (possible|likley))|(i) (think|believe) (this|that|it) ?(is)? ?(possible|could happen)|(It is|it''s) (possible|probable))|(^it could happen$)', 'I agree, this does seem possible.', false, 112, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '^(?i)(I love you|Love you|ILuvu|I love u|I luv u|I luv you)', 'I love you both', false, 113, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('(?i)^(?!.*(pokemon|bulbasaur|charmander|squirtle))', '(?i)(bulbasaur)', 'Whenever I play Pokemon I need 3 save spots, one for my Charmander, one for my Squirtle, and one for my second Charmander.', false, 114, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('(?i)^(?!.*(pokemon|bulbasaur|charmander|squirtle))', '(?i)(charmander)', 'Whenever I play Pokemon I need 3 save spots, one for my Squirtle, one for my Bulbasaur, and one for my second Squirtle.', false, 115, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('(?i)^(?!.*(pokemon|bulbasaur|charmander|squirtle))', '(?i)(squirtle)', 'Whenever I play Pokemon I need 3 save spots, one for my Bulbasaur, one for my Charmander, and one for my second Bulbasaur.', false, 116, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '.*?(then|than) (everyone|everbody|everybody|all people|every one|every body) (stood up|standed up)? ?(and)? ?(clapped|applauded|appluaded|standing ovation).*', 'Can confirm this is true. I was also applauding.', false, 117, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '^(.*)?(?i)((what|whats|what''s) ((the|da) (fudge|hell|heck|fuck|fucking) )?((is|does) )?this( supposed to)? ((fucking|flipping) )?mean)[?]?$', '>this\n>[th is]  \n>1.  \n>*(used to indicate a person, thing, idea, state, event, time, remark, etc., as present, near, just mentioned or pointed out, supposed to be understood, or by way of emphasis):    e.g **This is my coat.**', false, 118, 'Agree-with-you');
INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '^(.*)?(?i)((what|whats|what''s) ((the|da) (fudge|hell|heck|fuck|fucking) )?((is|does) )?that( supposed to)? ((fucking|flipping) )?mean)[?]?$', '>that\n>[th at; unstressed th uh t]  \n>1.  \n>*(used to indicate a person, thing, idea, state, event, time, remark, etc., as pointed out or present, mentioned before, supposed to be understood, or by way of emphasis):*    e.g **That is her mother. After that we saw each other.**', false, 119, 'Agree-with-you');
--INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '(?i)(.*(denton|dentan).*(alcohol|beer|vodka|rum|alchol|wine|booz|booze).*(delivery|deliver|delivry|ship|shipped|delivered|delivrd))', 'hello', false, 135, 'DISCORD');
--INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '(?i)(.*(denton|dentan).*(alcohol|beer|vodka|rum|alchol|wine|booz|booze).*(delivery|deliver|delivry|ship|shipped|delivered|delivrd))', 'hello', false, 136, 'DISCORD');
--INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '(?i)(.*(alcohol|beer|vodka|rum|alchol|wine|booz|booze).*(denton|dentan).*(delivery|deliver|delivry|ship|shipped|delivered|delivrd))', 'hello', false, 137, 'DISCORD');
--INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '(?i)(.*(alcohol|beer|vodka|rum|alchol|wine|booz|booze).*(delivery|deliver|delivry|ship|shipped|delivered|delivrd).*(denton|dentan))', 'hello', false, 138, 'DISCORD');
--INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '(?i)(.*(delivery|deliver|delivry|ship|shipped|delivered|delivrd).*(denton|dentan).*(alcohol|beer|vodka|rum|alchol|wine|booz|booze))', 'hello', false, 139, 'DISCORD');
--INSERT INTO public."RegexpComment"("SubredditMatch", "CommentMatch", "ReplyMessage", "IsReplyRegexp", "id", "Handle") VALUES ('.*', '(?i)(.*(delivery|deliver|delivry|ship|shipped|delivered|delivrd).*(alcohol|beer|vodka|rum|alchol|wine|booz|booze).*(denton|dentan))', 'hello', false, 140, 'DISCORD');

CREATE TABLE public."ErrorTable" (
    id integer NOT NULL,
    errordescription character varying(10000),
    errortrace character varying(10000),
    additionalinfo character varying(10000),
    redditCommentInfo character varying(15000),
    createdon timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE SEQUENCE public.errortable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE ONLY public."ErrorTable" ALTER COLUMN id SET DEFAULT nextval('public.errortable_id_seq'::regclass);





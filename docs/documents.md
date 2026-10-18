# Application documents

Permission letters and supporting documents carry signatures, letterheads and
contact details. This is how they are stored, so that only the people with a
reason to read one can.

Status: design agreed for phase 2. The `application_documents` table exists;
the upload and download routes do not yet.

## Where the bytes live

A **private Cloudflare R2 bucket**, the same storage verp's bug-report worker
uses, so VOSS already runs and pays for it. The bucket has no public access and
no `r2.dev` URL. Nothing in it is reachable without a signature the app issues.

The database holds only the pointer (`application_documents.storage_key`) and
what the approver needs to see in a list: name, type, size.

## Upload

1. The browser asks the app for an upload slot, naming the file, its type and
   size. The app checks them before anything is stored:
   - type is one of PDF, DOC, DOCX, PNG, JPEG;
   - size is at most 10 MB;
   - the application is the caller's own and still editable.
2. The app generates the key itself: `applications/<application id>/<uuid>.<ext>`.
   The user's file name never becomes part of a path.
3. The app returns a presigned `PUT` URL, valid for 5 minutes, bound to that
   key, content type and content length. The bytes go straight from the browser
   to R2, so large files never pass through a serverless function.
4. The browser tells the app the upload finished. The app reads the object's
   first bytes from R2 and checks they match the claimed type (a PDF starts
   `%PDF`), then writes the `application_documents` row. An upload that is never
   confirmed has no row and is deleted by a bucket lifecycle rule after a day.

## Download

There are no permanent links. To open a document, the app checks the caller may
see that application (its applier, or an approver), then returns a presigned
`GET` URL valid for 5 minutes, with `Content-Disposition: attachment` so the
file downloads rather than rendering inside the portal's origin.

## Why not the alternatives

- **Public bucket or public blob URLs**: a guessable or leaked link would expose
  a signed letter forever.
- **Files in Postgres**: bloats the database and its backups, and every byte
  passes through a serverless function with tight body-size limits.
- **Vercel Blob**: works, but adds a second storage vendor where VOSS already
  runs R2.

## Configuration

Server-side only, never exposed to the browser:

| Variable               | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `R2_ACCOUNT_ID`        | Cloudflare account                        |
| `R2_ACCESS_KEY_ID`     | R2 API token scoped to this bucket only   |
| `R2_SECRET_ACCESS_KEY` | its secret                                |
| `R2_BUCKET`            | bucket name, e.g. `vauditorium-documents` |

The R2 token should have object read and write on this one bucket and nothing
else, so a leaked key cannot touch any other VOSS storage.

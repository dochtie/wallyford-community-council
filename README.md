# Wallyford Community Council website

A simple website for Wallyford Community Council, built with [Jekyll](https://jekyllrb.com/) so that GitHub Pages can host it for free.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Wallyford (history, mining, the Bing, the Drift) | `wallyford.html` |
| The Council (remit, who we are, meetings, Torchlight Parade) | `council.html` |
| Local groups (TRAs, Neighbourhood Watch) | `groups.html` |
| Report it | `report.html` |
| You said, we did | `you-said-we-did.html` |

## Everyday updates (no coding needed)

You can edit any of these files on github.com: open the file, click the pencil icon, make the change, then click **Commit changes**. The live site updates a minute or two later.

- **Contact details, Facebook link, meeting details:** `_config.yml`
- **Councillors (names, roles, photos, blurbs):** `_data/councillors.yml`. Put photos in `assets/img/people/` and add the file name to `photo:`.
- **Local groups:** `_data/groups.yml`
- **You said, we did:** you don't edit the website at all. Update the Google Sheet and the page picks up the changes (see below).

## You said, we did

The page reads a Google Sheet published as CSV.

1. Open the tracker sheet in Google Drive (*Wallyford CC - You said, we did tracker*). Its **How to use** tab explains each column.
2. In the sheet: **File > Share > Publish to web**. Under *Link*, choose the **Tracker** tab and **Comma-separated values (.csv)**, then **Publish**.
3. Copy the link and paste it into `tracker_csv_url` in `_config.yml`.

Only rows with **Show on website** ticked appear. Never put residents' names or contact details in the sheet: everything on the Tracker tab is public once published.

Until a link is added, the page shows clearly labelled example entries (in draft mode only).

## Before going live

- Set `show_review_notes: false` in `_config.yml`. This hides the purple "Please check" and "To fill in" notes, which are there for the council to work through.
- Add the Facebook group link, the tracker link, councillor photos and blurbs, and local group details.
- Check that you have permission to use every photo.

## Turning on GitHub Pages

In the repository on GitHub: **Settings > Pages**. Under *Build and deployment*, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save. The site appears at `https://dochtie.github.io/wallyford-community-council/`.

If you later buy a web address (for example `wallyfordcc.org.uk`), add it under **Settings > Pages > Custom domain** and change `baseurl` to `""` in `_config.yml`.

## Previewing on your own computer (optional)

```
gem install jekyll
jekyll serve
```

Then open http://localhost:4000/wallyford-community-council/.

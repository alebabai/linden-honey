class QuoteRepository {
    constructor({ collection }) {
        this.collection = collection
    }

    getRandomQuote = async () => {
        const quotes = await this.collection
            .aggregate([
                { $unwind: '$verses' },
                { $unwind: '$verses.quotes' },
                { $sample: { size: 1 } },
                {
                    $project: {
                        _id: false,
                        phrase: '$verses.quotes.phrase'
                    }
                }
            ])
            .toArray()
        return quotes && quotes[0]
    }


    findQuotesByPhrase = (phrase, pageable = { page: 0, size: 20, order: "asc" }) => {
        const query = phrase && phrase.trim()
        const page = pageable.page && parseInt(pageable.page) || 0
        const size = pageable.size && parseInt(pageable.size) || 20
        const skip = page * size
        const order = pageable.order === 'asc' ? 1 : pageable.order === 'desc' ? -1 : 1
        return !query ? [] : this.collection
            .aggregate([
                { $unwind: '$verses' },
                { $unwind: '$verses.quotes' },
                {
                    $match: {
                        'verses.quotes.phrase': {
                            $regex: query,
                            $options: 'i'
                        }
                    }
                },
                { $group: { _id: '$verses.quotes.phrase' } },
                {
                    $project: {
                        _id: false,
                        phrase: '$_id'
                    }
                },
                { $skip: skip },
                { $limit: size },
                { $sort: { phrase: order } }
            ])
            .toArray()
    }

}

module.exports = QuoteRepository

function validateCheckIn({ category, location, photo }) {
    if (!category) {
        throw new Error('Employee category is required');
    }

    switch (category) {
        case 'REGULER':
            return;

        case 'MAHASISWA':
            return;

        case 'KEBUN':
            if (!location) {
                throw new Error('Location is required for KEBUN check-in');
            }
            if (!photo) {
                throw new Error('Photo is required for KEBUN check-in');
            }
            return;

        default:
            throw new Error('Unknown employee category');
    }
}

function validateCheckOut({ category, location, photo }) {
    if (!category) {
        throw new Error('Employee category is required');
    }

    switch (category) {
        case 'REGULER':
        case 'MAHASISWA':
            return;

        case 'KEBUN':
            if (!location) {
                throw new Error('Location is required for KEBUN check-out');
            }
            if (!photo) {
                throw new Error('Photo is required for KEBUN check-out');
            }
            return;

        default:
            throw new Error('Unknown employee category');
    }
}

module.exports = {
    validateCheckIn,
    validateCheckOut,
};

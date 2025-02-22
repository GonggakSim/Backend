// 사용자 정보 수집 DTO
export const userConsentDto = ( body: {
    age: any,
    department: string,
    grade: string,
    category: string[],
    employmentStatus: string,
    employCategory: string,
}) => {
    return {
        age: body.age,
        department: body.department,
        grade: body.grade,
        category: body.category,
        employmentStatus: body.employmentStatus,
        employCategory: body.employCategory,
    };
};

// 유사 사용자 시험 추천 DTO
export interface SuggestInfoDto {
    id: number;
    name: string;
    category: string;
}

export interface UserSimilarityInfo {
    user: UserWithDetails;
    similarity: number;
  }
  
export interface UserWithDetails {
    id: number;
    age: number | null;
    employmentStatus: string | null;
    users: { category: { id: number; name: string } }[];
    exams: { id: number; title: string }[];
  }
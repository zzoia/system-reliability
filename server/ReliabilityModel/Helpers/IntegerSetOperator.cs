using System.Collections.Generic;
using System.Linq;

namespace ReliabilityModel.Model.Helpers
{
    public class IntegerSetOperator
    {
        private readonly IReadOnlyList<int> _reversedMaxValues;

        public IntegerSetOperator(IEnumerable<int> maxValues)
        {
            _reversedMaxValues = maxValues.Reverse().ToList();
        }

        public int[] Increment(IReadOnlyList<int> values)
        {
            int[] reversedValues = values.Reverse().ToArray();
            int[] result = reversedValues.ToArray();

            for (var index = 0; index < reversedValues.Length; index++)
            {
                if (reversedValues[index] < _reversedMaxValues[index])
                {
                    result[index] += 1;
                    break;
                }

                result[index] = 0;
            }

            return result.Reverse().ToArray();
        }

        public bool IsMax(IReadOnlyList<int> integerSet) => integerSet.Reverse().SequenceEqual(_reversedMaxValues);
    }
}